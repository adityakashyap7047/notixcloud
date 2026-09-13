#!/bin/bash

set -e

PANEL_URL="${PANEL_URL:-http://localhost:3000}"
NODE_API_KEY="${NODE_API_KEY:-}"
NODE_NAME="${NODE_NAME:-Free VPS Node}"
NODE_IP="${NODE_IP:-$(curl -s ifconfig.me)}"
CHECK_INTERVAL="${CHECK_INTERVAL:-30}"

if [ -z "$NODE_API_KEY" ]; then
    echo "Error: NODE_API_KEY is required"
    echo "Usage: NODE_API_KEY=your_key PANEL_URL=http://your-panel.com bash node-daemon.sh"
    exit 1
fi

echo "=== NotixCloud Node Daemon ==="
echo "Panel URL: $PANEL_URL"
echo "Node Name: $NODE_NAME"
echo "Node IP: $NODE_IP"
echo "Check Interval: ${CHECK_INTERVAL}s"
echo "============================="

install_docker() {
    if command -v docker &> /dev/null; then
        echo "[✓] Docker is already installed"
        return
    fi

    echo "[*] Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "[✓] Docker installed successfully"
}

get_server_list() {
    curl -s -H "Authorization: Bearer $NODE_API_KEY" \
        "$PANEL_URL/api/nodes/heartbeat" | \
        jq -r '.servers[] | @json' 2>/dev/null || echo ""
}

create_server_container() {
    local server_name="$1"
    local version="$2"
    local server_type="$3"
    local port="$4"
    local ram="$5"

    local image="itzg/minecraft-server:paper"
    case "$server_type" in
        spigot) image="itzg/minecraft-server:spigot" ;;
        purpur) image="itzg/minecraft-server:purpur" ;;
        vanilla) image="itzg/minecraft-server:vanilla" ;;
        forge) image="itzg/minecraft-server:forge" ;;
        fabric) image="itzg/minecraft-server:fabric" ;;
    esac

    echo "[*] Creating container for $server_name..."
    
    docker run -d \
        --name "mc-$server_name" \
        -e EULA=TRUE \
        -e VERSION="$version" \
        -e TYPE="$(echo $server_type | tr '[:lower:]' '[:upper:]')" \
        -e MEMORY="${ram}M" \
        -p "$port:25565" \
        --memory="${ram}m" \
        --cpus="0.5" \
        --label "notixcloud=true" \
        --label "notixcloud.server=$server_name" \
        --restart unless-stopped \
        -v "/opt/minecraft/data/$server_name:/data" \
        "$image"
    
    echo "[✓] Container created for $server_name"
}

stop_server_container() {
    local server_name="$1"
    echo "[*] Stopping $server_name..."
    docker stop "mc-$server_name" 2>/dev/null || true
    echo "[✓] Stopped $server_name"
}

remove_server_container() {
    local server_name="$1"
    echo "[*] Removing $server_name..."
    docker rm -f "mc-$server_name" 2>/dev/null || true
    echo "[✓] Removed $server_name"
}

send_heartbeat() {
    local servers_data="[]"
    
    local running_containers=$(docker ps --filter "label=notixcloud" --format "{{.Names}}" 2>/dev/null || echo "")
    
    if [ -n "$running_containers" ]; then
        servers_data="["
        first=true
        while IFS= read -r container; do
            local server_name="${container#mc-}"
            local container_id=$(docker inspect -f '{{.Id}}' "$container" 2>/dev/null || echo "")
            local status=$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null || echo "unknown")
            
            local docker_status="RUNNING"
            case "$status" in
                running) docker_status="RUNNING" ;;
                exited|dead) docker_status="OFFLINE" ;;
                restarting) docker_status="STARTING" ;;
            esac
            
            if [ "$first" = true ]; then
                first=false
            else
                servers_data+=","
            fi
            
            servers_data+="{\"name\":\"$server_name\",\"containerId\":\"$container_id\",\"status\":\"$docker_status\"}"
        done <<< "$running_containers"
        servers_data+="]"
    fi
    
    curl -s -X POST \
        -H "Authorization: Bearer $NODE_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"servers\":$servers_data,\"stats\":{\"cpu\":$(top -bn1 | grep "Cpu(s)" | awk '{print $2}'),\"memory\":$(free | awk '/Mem:/ {printf \"%.1f\", $3/$2 * 100}'),\"disk\":$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')}}" \
        "$PANEL_URL/api/nodes/heartbeat" > /dev/null 2>&1
}

monitor_servers() {
    echo "[*] Monitoring servers..."
    
    while true; do
        send_heartbeat
        
        local response=$(curl -s -H "Authorization: Bearer $NODE_API_KEY" "$PANEL_URL/api/nodes/heartbeat")
        
        echo "$response" | jq -r '.servers[] | @json' 2>/dev/null | while read -r server_json; do
            local server_name=$(echo "$server_json" | jq -r '.name')
            local action=$(echo "$server_json" | jq -r '.action // empty')
            local container_exists=$(docker ps -a --filter "name=mc-$server_name" --format "{{.Names}}" 2>/dev/null)
            
            case "$action" in
                create)
                    local version=$(echo "$server_json" | jq -r '.version // "1.20.4"')
                    local type=$(echo "$server_json" | jq -r '.type // "paper"')
                    local port=$(echo "$server_json" | jq -r '.port // 25565')
                    local ram=$(echo "$server_json" | jq -r '.allocatedRam // 2048')
                    
                    if [ -z "$container_exists" ]; then
                        create_server_container "$server_name" "$version" "$type" "$port" "$ram"
                    fi
                    ;;
                start)
                    if [ -n "$container_exists" ]; then
                        local status=$(docker inspect -f '{{.State.Status}}' "mc-$server_name" 2>/dev/null)
                        if [ "$status" != "running" ]; then
                            docker start "mc-$server_name"
                        fi
                    fi
                    ;;
                stop)
                    if [ -n "$container_exists" ]; then
                        stop_server_container "$server_name"
                    fi
                    ;;
                restart)
                    if [ -n "$container_exists" ]; then
                        docker restart "mc-$server_name"
                    fi
                    ;;
                delete)
                    remove_server_container "$server_name"
                    ;;
            esac
        done
        
        sleep "$CHECK_INTERVAL"
    done
}

install_docker
monitor_servers
