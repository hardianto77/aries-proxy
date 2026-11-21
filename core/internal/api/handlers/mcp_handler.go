package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// MCPHandler implements a stateless Model Context Protocol (MCP) server over
// HTTP (JSON-RPC 2.0). It exposes Aries Proxy management capabilities as MCP
// tools so AI clients (Claude, ChatGPT plugins, IDE agents) can operate the
// proxy platform directly.
//
// Endpoint: POST /api/v1/mcp   (Bearer JWT auth, same as the management API)
// Protocol: JSON-RPC 2.0, methods: initialize, tools/list, tools/call,
//           ping. Notifications are accepted and answered with 202.
type MCPHandler struct {
	dashboard *DashboardHandler
	proxy     *ProxyHandler
}

// NewMCPHandler wires the MCP handler to existing services.
func NewMCPHandler(dash *DashboardHandler, px *ProxyHandler) *MCPHandler {
	return &MCPHandler{dashboard: dash, proxy: px}
}

// ---------- JSON-RPC 2.0 types ----------

type mcpRequest struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      json.RawMessage `json:"id,omitempty"`
	Method  string          `json:"method"`
	Params  struct {
		Name      string          `json:"name,omitempty"`
		Arguments json.RawMessage `json:"arguments,omitempty"`
	} `json:"params"`
}

type mcpResponse struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      json.RawMessage `json:"id,omitempty"`
	Result  interface{}     `json:"result,omitempty"`
	Error   *mcpError       `json:"error,omitempty"`
}

type mcpError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type mcpTool struct {
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	InputSchema map[string]interface{} `json:"inputSchema"`
}

type mcpTextContent struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

type mcpCallResult struct {
	Content []mcpTextContent `json:"content"`
	IsError bool             `json:"isError,omitempty"`
}

// ---------- tool registry ----------

func (h *MCPHandler) tools() []mcpTool {
	return []mcpTool{
		{
			Name:        "aries_proxy_status",
			Description: "Get Aries Proxy service status: uptime, total proxies, healthy proxies, active pools and request counters.",
			InputSchema: map[string]interface{}{
				"type":       "object",
				"properties": map[string]interface{}{},
			},
		},
		{
			Name:        "aries_proxy_list_working_proxies",
			Description: "List currently-active exit proxies (address, protocol, latency, last checked) as tracked by pool health checks.",
			InputSchema: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"limit": map[string]interface{}{
						"type":        "integer",
						"description": "Maximum number of proxies to return (default 20, max 100).",
						"default":     20,
					},
				},
			},
		},
		{
			Name:        "aries_proxy_client_url",
			Description: "Build a ready-to-use proxy URL for a client in the standard user:pass@host:port format. Requires the proxy username and password (plaintext is not stored server-side; the caller supplies it).",
			InputSchema: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"username": map[string]interface{}{"type": "string", "description": "Aries Proxy username"},
					"password": map[string]interface{}{"type": "string", "description": "Aries Proxy password (URL-encoded if it contains special characters)"},
					"host":     map[string]interface{}{"type": "string", "description": "Proxy host (default: resi.aries.ai.id)", "default": "resi.aries.ai.id"},
					"port":     map[string]interface{}{"type": "integer", "description": "Proxy port (default: 25600)", "default": 25600},
				},
				"required": []string{"username", "password"},
			},
		},
	}
}

// ---------- JSON-RPC dispatch ----------

// ServeMCP handles POST /api/v1/mcp
func (h *MCPHandler) ServeMCP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.Header().Set("Allow", "POST")
		h.writeJSONRPC(w, http.StatusMethodNotAllowed, mcpResponse{JSONRPC: "2.0", Error: &mcpError{Code: -32600, Message: "POST required"}})
		return
	}
	var req mcpRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeJSONRPC(w, http.StatusBadRequest, mcpResponse{JSONRPC: "2.0", Error: &mcpError{Code: -32700, Message: "Parse error"}})
		return
	}

	switch req.Method {
	case "initialize":
		h.writeJSONRPC(w, http.StatusOK, mcpResponse{
			JSONRPC: "2.0", ID: req.ID,
			Result: map[string]interface{}{
				"protocolVersion": "2024-11-05",
				"capabilities":    map[string]interface{}{"tools": map[string]interface{}{"listChanged": false}},
				"serverInfo": map[string]interface{}{
					"name":    "aries-proxy",
					"version": "1.0.0",
				},
			},
		})
	case "notifications/initialized", "notifications/cancelled":
		w.WriteHeader(http.StatusAccepted)
	case "ping":
		h.writeJSONRPC(w, http.StatusOK, mcpResponse{JSONRPC: "2.0", ID: req.ID, Result: map[string]interface{}{}})
	case "tools/list":
		h.writeJSONRPC(w, http.StatusOK, mcpResponse{JSONRPC: "2.0", ID: req.ID, Result: map[string]interface{}{"tools": h.tools()}})
	case "tools/call":
		h.handleToolCall(w, r, &req)
	default:
		h.writeJSONRPC(w, http.StatusOK, mcpResponse{JSONRPC: "2.0", ID: req.ID, Error: &mcpError{Code: -32601, Message: "Method not found: " + req.Method}})
	}
}

func (h *MCPHandler) handleToolCall(w http.ResponseWriter, r *http.Request, req *mcpRequest) {
	var args map[string]interface{}
	if len(req.Params.Arguments) > 0 {
		_ = json.Unmarshal(req.Params.Arguments, &args)
	}

	var payload interface{}
	switch req.Params.Name {
	case "aries_proxy_status":
		stats, err := h.dashboard.dashboardRepo.GetStats(r.Context())
		if err != nil {
			h.toolError(w, req, "failed to collect stats")
			return
		}
		payload = stats
	case "aries_proxy_list_working_proxies":
		limit := 20
		if v, ok := args["limit"].(float64); ok && v >= 1 && v <= 100 {
			limit = int(v)
		}
		proxies, _, err := h.proxy.proxyRepo.List(r.Context(), 1, limit, "", "active", "", "", "")
		if err != nil {
			h.toolError(w, req, "failed to list working proxies")
			return
		}
		payload = proxies
	case "aries_proxy_client_url":
		user, _ := args["username"].(string)
		pass, _ := args["password"].(string)
		host, _ := args["host"].(string)
		if host == "" {
			host = "resi.aries.ai.id"
		}
		port := 25600.0
		if v, ok := args["port"].(float64); ok {
			port = v
		}
		if user == "" || pass == "" {
			h.toolError(w, req, "username and password are required")
			return
		}
		payload = map[string]string{
			"url":      fmt.Sprintf("http://%s:%s@%s:%d", user, pass, host, int(port)),
			"host":     host,
			"port":     fmt.Sprintf("%d", int(port)),
			"username": user,
			"protocol": "http",
			"note":     "URL-encode special characters in the password (e.g. @ -> %40)",
		}
	default:
		h.writeJSONRPC(w, http.StatusOK, mcpResponse{JSONRPC: "2.0", ID: req.ID, Error: &mcpError{Code: -32602, Message: "Unknown tool: " + req.Params.Name}})
		return
	}

	b, _ := json.Marshal(payload)
	h.writeJSONRPC(w, http.StatusOK, mcpResponse{
		JSONRPC: "2.0", ID: req.ID,
		Result: mcpCallResult{Content: []mcpTextContent{{Type: "text", Text: string(b)}}},
	})
}

func (h *MCPHandler) toolError(w http.ResponseWriter, req *mcpRequest, msg string) {
	h.writeJSONRPC(w, http.StatusOK, mcpResponse{
		JSONRPC: "2.0", ID: req.ID,
		Result: mcpCallResult{Content: []mcpTextContent{{Type: "text", Text: msg}}, IsError: true},
	})
}

func (h *MCPHandler) writeJSONRPC(w http.ResponseWriter, status int, resp mcpResponse) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(resp)
}
