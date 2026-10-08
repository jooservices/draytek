// Site-level strings and URL helpers.
import type { Lang } from './types';

export const LANGS: Lang[] = ['vi', 'en'];
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Build a site URL: href('vi', 'devices/v2928') -> /vi/devices/v2928/ */
export const href = (lang: Lang, path = '') => `${base}/${lang}/${path ? path.replace(/^\/|\/$/g, '') + '/' : ''}`;
export const asset = (path: string) => `${base}/${path.replace(/^\//, '')}`;

export const UI: Record<Lang, Record<string, string>> = {
  vi: {
    site: 'Port Atlas',
    nHome: 'Trang chủ', nDevices: 'Thiết bị', nCompare: 'So sánh', nAdvisor: 'Tư vấn', nGuides: 'Kiến thức', nSecurity: 'Bảo mật',
    heroH: 'Chọn đúng router, Wi‑Fi và switch cho mạng của bạn',
    heroP: 'Gõ nhu cầu bằng lời thường. Port Atlas tìm trong hơn 80 thiết bị có thông số đối chiếu từ tài liệu chính thức.',
    heroPh: 'Ví dụ: quán cafe 60 khách, 2 đường mạng, camera PoE…',
    search: 'Tìm thiết bị',
    tryLbl: 'Thử tìm:',
    byUse: 'Bạn đang làm gì?', byUseP: 'Chọn tình huống gần nhất để xem thiết bị phù hợp.',
    byCat: 'Theo loại thiết bị', all: 'Xem tất cả',
    tools: 'Công cụ', toolAdv: 'Tư vấn chọn thiết bị', toolAdvP: 'Nhập số người dùng, đường truyền, VPN, Wi-Fi. Nhận gợi ý router, số AP và switch PoE.',
    toolCmp: 'So sánh thiết bị', toolCmpP: 'Đặt tối đa 4 thiết bị cạnh nhau, chỉ ra điểm khác nhau.',
    toolSec: 'Firmware và bảo mật', toolSecP: 'Phiên bản firmware mới nhất, cảnh báo lỗ hổng và vòng đời hỗ trợ.',
    toolGuide: 'Kiến thức nền', toolGuideP: 'Đọc tên model, hệ điều hành, thuật ngữ và nguồn dữ liệu.',
    featured: 'Thiết bị nổi bật', devicesN: 'thiết bị', dataH: 'Dữ liệu có nguồn',
    dataP: 'Mỗi thông số ghi rõ nguồn: datasheet, Databook 2026 hoặc trang hỗ trợ. Chỗ chưa tìm thấy được ghi "chưa xác minh", không đoán.',
    secH: 'Firmware và bảo mật', secP: 'Phiên bản firmware mới nhất theo model và các cảnh báo bảo mật đã biết.',
    guideH: 'Kiến thức nền',
    langName: 'English', theme: 'Đổi giao diện sáng/tối', compareOpen: 'Mở trang so sánh',
    footer: 'Trang tham khảo độc lập. Số liệu tổng hợp từ Databook 2026, datasheet và trang hỗ trợ chính thức; có thể thay đổi theo firmware và khu vực. Hãy kiểm tra lại trước khi mua.',
    photo: 'Ảnh sản phẩm', diagram: 'Sơ đồ cổng',
  },
  en: {
    site: 'Port Atlas',
    nHome: 'Home', nDevices: 'Devices', nCompare: 'Compare', nAdvisor: 'Advisor', nGuides: 'Guides', nSecurity: 'Security',
    heroH: 'Pick the right router, Wi-Fi and switch for your network',
    heroP: 'Describe what you need in plain words. Port Atlas searches 80+ devices with specs checked against official documents.',
    heroPh: 'For example: cafe with 60 guests, 2 internet lines, PoE cameras…',
    search: 'Search devices',
    tryLbl: 'Try:',
    byUse: 'What are you setting up?', byUseP: 'Pick the closest situation to see matching devices.',
    byCat: 'By device type', all: 'See all',
    tools: 'Tools', toolAdv: 'Device advisor', toolAdvP: 'Enter users, internet lines, VPN and Wi-Fi needs. Get a router, AP count and PoE switch suggestion.',
    toolCmp: 'Compare devices', toolCmpP: 'Put up to 4 devices side by side and see what differs.',
    toolSec: 'Firmware and security', toolSecP: 'Latest firmware versions, vulnerability notices and support lifecycle.',
    toolGuide: 'Background guides', toolGuideP: 'Model names, operating systems, glossary and data sources.',
    featured: 'Featured devices', devicesN: 'devices', dataH: 'Sourced data',
    dataP: 'Every value cites its source: datasheet, Databook 2026 or support page. Anything not found is marked "unverified", never guessed.',
    secH: 'Firmware and security', secP: 'Latest firmware per model and known security notices.',
    guideH: 'Background guides',
    langName: 'Tiếng Việt', theme: 'Toggle light/dark theme', compareOpen: 'Open compare page',
    footer: 'Independent reference site. Data compiled from Databook 2026, official datasheets and support pages; it can change with firmware and region. Verify before buying.',
    photo: 'Product photo', diagram: 'Port layout',
  },
};
