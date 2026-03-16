# PLAN: Device Type Intelligence & Visualization

This plan covers the implementation of automatic device type detection and enhanced icon-based visualization for the Net-Monitor application.

## 1. Analysis & Heuristics
We will implement a lightweight port-based heuristic to guess the device type during the discovery phase.

| Device Type | Ports / Indicators | Icon (Frontend) |
|-------------|--------------------|-----------------|
| **Router**  | 53 (DNS), 80/443 (Admin) | `Router` |
| **Server**  | 22 (SSH), 3306, 8080 | `Server` |
| **PC / Laptop** | 135, 139, 445 (SMB) | `Monitor` / `Laptop` |
| **Printer** | 9100, 631 | `Printer` |
| **Unknown** | Default fallback | `HelpCircle` |

## 2. Backend Implementation (`backend-specialist`)
- **Port Scanner:** Add a non-blocking `async_check_ports` function to `scanner.py`.
- **Heuristic Engine:** Create `identify_device_type(ip, open_ports)` logic.
- **Discovery Update:** Integrate the check into `auto_discover_subnet`.
- **API Update:** Ensure `DeviceUpdate` schema and `PUT` endpoint support changing `device_type`.

## 3. Frontend Implementation (`frontend-specialist`)
- **Icon Mapping:** Create a utility to map `device_type` strings to Lucide icons.
- **Add Device UI:** Add a dropdown/select to choose type.
- **Edit Device UI:** Add a dropdown to the Edit mode in the Detail Modal.
- **Visuals:** Display the specific icon on the device card and in the header of the detail view.

## 4. Database & Schema (`database-architect`)
- Current schema already supports `device_type`.
- Ensure default values and constraints are appropriate.

## 5. Verification (`test-engineer`)
- Manual verification of discovery with a sample local IP.
- UI audit for icon alignment and dropdown functionality.

---

## Task Breakdown
1. [x] [Backend] Implement port scanning utility in `scanner.py`.
2. [x] [Backend] Update discovery logic to use heuristics.
3. [x] [Frontend] Create icon mapping component/logic.
4. [x] [Frontend] Update Add/Edit modals with Device Type selection.
5. [x] [Frontend] Refresh Device Cards with specific icons.
