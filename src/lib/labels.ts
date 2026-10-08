// Feature/spec labels, ported from the Port Atlas prototype.
/* eslint-disable */
export const FLAG: Record<string, [string, string]> = {
  '2.5g': ['Cổng 2.5G', '2.5G ports'], '10g': ['Cổng 10G', '10G ports'], sfp: ['Khe SFP', 'SFP slot'], 'sfp+': ['SFP+ 10G', 'SFP+ 10G'],
  wifi5: ['Wi-Fi 5', 'Wi-Fi 5'], wifi6: ['Wi-Fi 6', 'Wi-Fi 6'], wifi7: ['Wi-Fi 7', 'Wi-Fi 7'], lte: ['4G tích hợp', 'Built-in 4G'], '5g': ['5G tích hợp', 'Built-in 5G'],
  usbmodem: ['Modem USB 4G', 'USB 4G modem'], dsl: ['ADSL/VDSL', 'ADSL/VDSL'], gfast: ['G.fast', 'G.fast'], pon: ['GPON/PON', 'GPON/PON'], xgspon: ['XGS-PON', 'XGS-PON'],
  wg: ['WireGuard', 'WireGuard'], openvpn: ['OpenVPN', 'OpenVPN'], ssl: ['SSL VPN', 'SSL VPN'], ha: ['High Availability', 'High Availability'], lb: ['Cân bằng tải WAN', 'WAN load balancing'],
  bgp: ['BGP', 'BGP'], ospf: ['OSPF', 'OSPF'], hotspot: ['Hotspot / captive portal', 'Hotspot / captive portal'], voip: ['VoIP (FXS)', 'VoIP (FXS)'], iam: ['IAM', 'IAM'],
  threat: ['Threat Protection', 'Threat Protection'], docker: ['Docker / SSD', 'Docker / SSD'], console: ['Cổng console', 'Console port'],
  poe: ['PoE', 'PoE'], 'poe++': ['PoE++ (802.3bt)', 'PoE++ (802.3bt)'], poeout: ['PoE ra', 'PoE out'], outdoor: ['Ngoài trời', 'Outdoor'], mesh: ['Mesh', 'Mesh'],
  l3: ['Định tuyến VLAN (L3 lite)', 'VLAN routing (L3 lite)'], stack: ['Xếp chồng', 'Stacking'], onvif: ['ONVIF camera', 'ONVIF cameras'], sdwan: ['SD-WAN', 'SD-WAN'], fanless: ['Không quạt (êm)', 'Fanless (silent)'], rack: ['Gắn rack có sẵn tai', 'Rack-mount kit included']
};

export const HWG: any = ['hw', ['Phần cứng', 'Hardware'], [
  ['h_cpu', ['CPU', 'CPU']], ['h_mem', ['RAM', 'RAM']], ['h_store', ['Lưu trữ', 'Storage']],
  ['h_pwr', ['Nguồn điện', 'Power input']], ['h_cons', ['Công suất tiêu thụ tối đa', 'Max power consumption']], ['h_poe', ['Cấp PoE', 'PoE output']],
  ['h_dim', ['Kích thước (R × S × C)', 'Dimensions (W × D × H)']], ['h_wt', ['Trọng lượng', 'Weight']],
  ['h_temp', ['Nhiệt độ hoạt động', 'Operating temperature']], ['h_hum', ['Độ ẩm (không ngưng tụ)', 'Humidity (non-condensing)']],
  ['h_cool', ['Tản nhiệt', 'Cooling']], ['h_mount', ['Lắp đặt', 'Mounting']], ['h_ant', ['Anten, SIM', 'Antennas, SIM']],
  ['h_fwd', ['Tốc độ chuyển tiếp', 'Forwarding rate']], ['h_buf', ['Bộ đệm gói', 'Packet buffer']], ['h_mac', ['Bảng MAC', 'MAC table']], ['h_jumbo', ['Jumbo frame', 'Jumbo frame']]
]];
export const SPEC: Record<string, any[]> = {
  router: [
    ['perf', ['Hiệu năng', 'Performance'], [['nat', ['NAT throughput', 'NAT throughput'], 'mbps'], ['sess', ['NAT sessions', 'NAT sessions'], 'k'], ['ipsec', ['IPsec VPN', 'IPsec VPN'], 'mbps'], ['ssl', ['SSL VPN', 'SSL VPN'], 'mbps'], ['wg', ['WireGuard', 'WireGuard'], 'mbps']]],
    ['ports', ['Cổng kết nối', 'Interfaces'], [['wanmax', ['Số WAN vật lý tối đa', 'Max physical WANs']], ['wan', ['WAN', 'WAN']], ['lan', ['LAN', 'LAN']], ['usb', ['USB', 'USB']], ['cell', ['4G / 5G', '4G / 5G']]]],
    ['vpn', ['VPN', 'VPN'], [['vpn', ['Kênh VPN tối đa', 'Max VPN tunnels']], ['sslvpn', ['Kênh SSL VPN / OpenVPN', 'SSL VPN / OpenVPN tunnels']], ['proto', ['Giao thức', 'Protocols']]]],
    ['lan', ['LAN và Wi-Fi', 'LAN & Wi-Fi'], [['vlan', ['VLAN tối đa', 'Max VLANs']], ['subnet', ['LAN subnet', 'LAN subnets']], ['wifi', ['Wi-Fi', 'Wi-Fi']], ['hotspot', ['Hotspot (xác thực)', 'Hotspot authentication']], ['voip', ['VoIP', 'VoIP']]]],
    ['route', ['Định tuyến và dự phòng', 'Routing & resilience'], [['routing', ['Định tuyến', 'Routing']], ['lb', ['Cân bằng tải WAN', 'WAN load balancing']], ['ha', ['High Availability', 'High Availability']]]],
    ['mgmt', ['Quản lý và bảo mật', 'Management & security'], [['apm', ['Quản lý AP', 'AP management']], ['swm', ['Quản lý switch', 'Switch management']], ['vpnm', ['Quản lý VPN tập trung', 'Central VPN management']], ['auth', ['Xác thực', 'Authentication']], ['secu', ['Bảo mật, lọc nội dung', 'Security & filtering']], ['extra', ['Khác', 'Other']], ['compat', ['Tương thích cấu hình', 'Config compatibility']]]],
    ['sys', ['Hệ thống', 'System'], [['os', ['Hệ điều hành', 'Operating system']], ['fwv', ['Firmware mới nhất', 'Latest firmware']], ['launch', ['Ra mắt (UK)', 'Launched (UK)']]]],
    HWG
  ],
  ap: [
    ['radio', ['Vô tuyến', 'Radio'], [['std', ['Chuẩn', 'Standard']], ['cls', ['Phân hạng', 'Class']], ['bands', ['Băng tần', 'Bands']], ['link', ['Tốc độ liên kết tối đa', 'Max link rate']], ['clients', ['Thiết bị tối đa', 'Max clients']], ['ssid', ['SSID mỗi băng', 'SSIDs per band']], ['mlo', ['Multi-Link Operation', 'Multi-Link Operation']]]],
    ['hw', ['Phần cứng và lắp đặt', 'Hardware & mounting'], [['ports', ['Cổng', 'Ports']], ['power', ['Nguồn', 'Power']], ['poein', ['Nhận PoE', 'PoE in']], ['poeout', ['Cấp PoE ra', 'PoE out']], ['mount', ['Lắp đặt', 'Mounting']], ['outdoor', ['Ngoài trời', 'Outdoor']], ['antenna', ['Anten', 'Antenna']], ['sensor', ['Cảm biến', 'Sensor']]]],
    ['mgmt', ['Quản lý', 'Management'], [['mesh', ['Mesh', 'Mesh']], ['hotspot', ['Hotspot web portal', 'Hotspot web portal']], ['mgmt', ['Quản lý tập trung', 'Central management']], ['launch', ['Ra mắt (UK)', 'Launched (UK)']]]],
    HWG
  ],
  switch: [
    ['ports', ['Cổng', 'Ports'], [['level', ['Loại quản lý', 'Management level']], ['ports', ['Cổng truy cập', 'Access ports']], ['uplink', ['Uplink', 'Uplink']], ['cap', ['Băng thông chuyển mạch', 'Switching capacity'], 'gbps']]],
    ['poe', ['PoE', 'PoE'], [['poe', ['Cổng PoE', 'PoE ports']], ['budget', ['Tổng công suất PoE', 'PoE budget'], 'w']]],
    ['feat', ['Tính năng', 'Features'], [['vlan', ['VLAN gắn tag', 'Tagged VLANs']], ['qos', ['Hàng đợi QoS', 'QoS queues']], ['l3', ['Lớp 3', 'Layer 3']], ['stp', ['Spanning Tree', 'Spanning Tree']], ['stack', ['Xếp chồng (tối đa)', 'Stacking (max)']], ['onvif', ['Quản lý camera ONVIF', 'ONVIF camera management']], ['extra', ['Khác', 'Other']]]],
    ['phys', ['Vật lý', 'Physical'], [['console', ['Cổng console', 'Console port']], ['rack', ['Gắn tủ rack 1U', '1U rack mount']], ['redund', ['Nguồn dự phòng', 'Power redundancy']], ['launch', ['Ra mắt (UK)', 'Launched (UK)']]]],
    HWG
  ],
  more: [['info', ['Thông tin', 'Overview'], [['kind', ['Loại', 'Type']], ['what', ['Chức năng', 'What it does']], ['models', ['Thiết bị hỗ trợ', 'Supported devices']]]]]
};
export const KEY: Record<string, any[]> = { router: [['nat', 'NAT', 'mbps'], ['sess', 'Sessions', 'k'], ['vpn', 'VPN'], ['wanmax', 'WAN']], ap: [['std', 'Std'], ['clients', 'Clients'], ['link', 'Link'], ['ports', 'Ports']], switch: [['ports', 'Ports'], ['uplink', 'Uplink'], ['budget', 'PoE', 'w'], ['cap', 'Capacity', 'gbps']], more: [['kind', 'Type']] };
export const KEYL: Record<string, any> = { vi: { NAT: 'NAT', Sessions: 'Session', VPN: 'Kênh VPN', WAN: 'WAN tối đa', Std: 'Chuẩn', Clients: 'Thiết bị', Link: 'Tốc độ', Ports: 'Cổng', Uplink: 'Uplink', PoE: 'PoE', Capacity: 'Chuyển mạch', Type: 'Loại' }, en: {} };
