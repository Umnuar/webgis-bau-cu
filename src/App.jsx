import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MapPin, Search, Map as MapIcon, Navigation, Info, ChevronRight, X, ArrowLeft, Layers, ShieldCheck, LocateFixed, AlertCircle, Calendar, Clock, ChevronDown, ChevronUp, QrCode, Download, ChevronLeft, Users, FileText, Menu } from 'lucide-react';

const mockCandidates = [
  { id: 'C1', ten: 'Nguyễn Văn A', nam_sinh: 1975, anh: 'https://i.pravatar.cc/150?u=C1', que_quan: 'Hà Nội', trinh_do: 'Thạc sĩ Kinh tế', nghe_nghiep: 'Công chức', don_vi_bau_cu: 'ĐƠN VỊ BẦU CỬ SỐ 1', tieu_su: 'Đã có nhiều đóng góp trong công tác quản lý kinh tế địa phương.' },
  { id: 'C2', ten: 'Trần Thị B', nam_sinh: 1982, anh: 'https://i.pravatar.cc/150?u=C2', que_quan: 'Hải Phòng', trinh_do: 'Tiến sĩ Luật', nghe_nghiep: 'Giảng viên', don_vi_bau_cu: 'ĐƠN VỊ BẦU CỬ SỐ 1', tieu_su: 'Chuyên gia tư vấn luật pháp, tham gia nhiều dự án cộng đồng.' },
  { id: 'C3', ten: 'Lê Văn C', nam_sinh: 1968, anh: 'https://i.pravatar.cc/150?u=C3', que_quan: 'Đà Nẵng', trinh_do: 'Cử nhân Chính trị', nghe_nghiep: 'Cán bộ hưu trí', don_vi_bau_cu: 'ĐƠN VỊ BẦU CỬ SỐ 2', tieu_su: 'Nguyên lãnh đạo cấp cơ sở, giàu kinh nghiệm thực tiễn.' }
];

const mockStations = [
  { 
    id: 'S1', 
    ten_diem: 'Khu vực bỏ phiếu số 1', 
    mo_ta_khu_vuc: 'gồm: Tổ dân phố 1 và tổ dân phố 4 Phường Quang Trung cũ',
    phuong_xa_cu: 'Phường Quang Trung cũ',
    don_vi_bau_cu: 'Đơn vị bầu cử số 1', 
    dia_chi_moi: 'Trường Tiểu học Lê Hồng Phong (số 115 Lê Hồng Phong)',
    lat: 21.0368, 
    lng: 105.7958, 
    so_cu_tri: 1200, 
    hinh_anh: 'https://images.unsplash.com/photo-1577493340887-b7bfff550145?w=1200&q=80' 
  },
  { 
    id: 'S2', 
    ten_diem: 'Khu vực bỏ phiếu số 2', 
    mo_ta_khu_vuc: 'gồm: Thôn Đông và Thôn Tây Phường Dịch Vọng Hậu cũ',
    phuong_xa_cu: 'Phường Quang Trung cũ',
    don_vi_bau_cu: 'Đơn vị bầu cử số 1', 
    dia_chi_moi: 'Hội trường Tổ dân phố 3 (Số 304 Xuân Thủy)',
    lat: 21.0381, 
    lng: 105.7892, 
    so_cu_tri: 950, 
    hinh_anh: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80' 
  },
  { 
    id: 'S3', 
    ten_diem: 'Khu vực bỏ phiếu số 3', 
    mo_ta_khu_vuc: 'gồm: Cụm dân cư số 5 và khu tập thể Bách Khoa',
    phuong_xa_cu: 'Phường Bách Khoa cũ',
    don_vi_bau_cu: 'Đơn vị bầu cử số 2', 
    dia_chi_moi: 'Sân vận động Bách Khoa (Số 1 Đại Cồ Việt)',
    lat: 21.0069, 
    lng: 105.8431, 
    so_cu_tri: 1500, 
    hinh_anh: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80' 
  }
];

export default function App() {
  const [activeStation, setActiveStation] = useState(null);
  const [detailedStation, setDetailedStation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [viewMode, setViewMode] = useState('detail'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const qrRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setLeafletLoaded(true);
      document.head.appendChild(script);
    } else {
      setLeafletLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (showQR && qrRef.current) {
      setTimeout(() => {
        qrRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [showQR]);

  const filteredStations = useMemo(() => {
    return mockStations.filter(s => {
      const matchesSearch = s.ten_diem.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.dia_chi_moi.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesWard = selectedWard === 'all' || s.phuong_xa_cu === selectedWard;
      const matchesUnit = selectedUnit === 'all' || s.don_vi_bau_cu === selectedUnit;
      return matchesSearch && matchesWard && matchesUnit;
    });
  }, [searchQuery, selectedWard, selectedUnit]);

  // Bộ lọc Phường/Xã khả dụng dựa trên Đơn vị bầu cử đã chọn
  const availableWards = useMemo(() => {
    const wards = selectedUnit === 'all' 
      ? mockStations 
      : mockStations.filter(s => s.don_vi_bau_cu === selectedUnit);
    return [...new Set(wards.map(s => s.phuong_xa_cu))].sort();
  }, [selectedUnit]);

  // Bộ lọc Đơn vị khả dụng dựa trên Phường/Xã đã chọn
  const availableUnits = useMemo(() => {
    const units = selectedWard === 'all' 
      ? mockStations 
      : mockStations.filter(s => s.phuong_xa_cu === selectedWard);
    return [...new Set(units.map(s => s.don_vi_bau_cu))].sort();
  }, [selectedWard]);

  const getDirections = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  useEffect(() => {
    window.openDirections = getDirections;
    window.openStationDetails = (id) => {
      const st = mockStations.find(s => s.id === id);
      if (st) {
        setDetailedStation(st);
        setViewMode('detail');
        setShowQR(false);
      }
    };
  }, []);

  const MapSidebar = () => (
    <div className={`fixed md:relative w-full md:w-[400px] bg-[#f0ece9] flex flex-col h-[50vh] md:h-screen shadow-2xl z-[1000] border-r border-gray-300 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:-ml-[400px]'}`}>
      
      <div className="bg-[#f8f9fa] p-4 flex items-center gap-3 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="p-1 hover:bg-gray-200 rounded-full transition text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
        <h1 className="text-[17px] font-bold text-[#b83332] tracking-tight">
          Danh sách {filteredStations.length} khu vực bỏ phiếu
        </h1>
      </div>
      
      <div className="p-4 bg-white/50 backdrop-blur-sm border-b border-gray-200/50">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Tìm kiếm nhanh..." 
              className="w-full p-2.5 pl-9 rounded-xl border border-gray-300 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 text-sm bg-white shadow-sm transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          </div>
          <button className="bg-[#b83332] text-white px-3 py-2 rounded-xl font-bold text-[13px] flex items-center gap-1.5 hover:bg-[#991b1b] transition shadow-md whitespace-nowrap">
            <MapPin className="w-4 h-4" /> Vị trí của tôi
          </button>
        </div>
        
        <div className="flex gap-2">
          <select 
            className="flex-1 p-2 rounded-lg border border-gray-200 text-[13px] text-gray-600 bg-white focus:outline-none cursor-pointer hover:border-red-300 transition"
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
          >
            <option value="all">Tất cả Phường/Xã</option>
            {availableWards.map(ward => (
              <option key={ward} value={ward}>{ward}</option>
            ))}
          </select>
          <select 
            className="flex-1 p-2 rounded-lg border border-gray-200 text-[13px] text-gray-600 bg-white focus:outline-none cursor-pointer hover:border-red-300 transition"
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
          >
            <option value="all">Chọn đơn vị bầu cử</option>
            {availableUnits.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {filteredStations.length > 0 ? filteredStations.map(station => (
          <div 
            key={station.id} 
            className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-3 hover:shadow-md hover:border-red-200 transition-all cursor-pointer flex flex-col"
            onClick={() => setActiveStation(station)}
          >
            <div className="relative w-full h-40 mb-3 overflow-hidden rounded-xl">
              <img src={station.hinh_anh} alt={station.ten_diem} className="w-full h-full object-cover border border-gray-100 group-hover:scale-105 transition-transform duration-500" />
            </div>
            
            <div className="px-1 flex flex-col gap-1">
              <h3 className="font-bold text-[16px] text-gray-900 leading-tight mb-1 uppercase line-clamp-1">{station.ten_diem}</h3>
              
              <div className="flex items-start gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-[13px] font-bold text-[#b83332] uppercase">
                  {station.don_vi_bau_cu} <span className="font-normal text-red-600/70 lowercase">({station.phuong_xa_cu})</span>
                </p>
              </div>

              <div className="flex items-start gap-1.5 mb-3">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <p className="text-[13px] text-gray-500 leading-snug uppercase">
                  TẠI {station.dia_chi_moi}
                </p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setDetailedStation(station); setViewMode('detail'); setShowQR(false); }}
                  className="flex-1 bg-[#b83332] text-white py-2 rounded-lg font-bold hover:bg-[#991b1b] flex items-center justify-center text-sm transition"
                >
                  Xem chi tiết
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); getDirections(station.lat, station.lng); }}
                  className="flex-1 bg-[#f5e6e6] text-[#b83332] py-2 rounded-lg font-bold hover:bg-[#ebd5d5] flex items-center justify-center gap-1.5 text-sm transition border border-red-100"
                >
                  <Navigation className="w-4 h-4"/> Chỉ đường
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium px-4">Không tìm thấy địa điểm nào khớp với bộ lọc của bạn.</p>
            <button 
              onClick={() => { setSelectedWard('all'); setSelectedUnit('all'); setSearchQuery(''); }}
              className="mt-4 text-[#b83332] text-sm font-bold hover:underline"
            >
              Thiết lập lại bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const MapArea = () => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef([]);
    const tileLayerRef = useRef(null);
    const [isSatellite, setIsSatellite] = useState(true);

    useEffect(() => {
      if (!leafletLoaded || !window.L || !mapRef.current) return;
      if (!mapInstance.current) {
        mapInstance.current = window.L.map(mapRef.current, { zoomControl: false }).setView([21.0285, 105.8542], 12);
      }
      const map = mapInstance.current;
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      filteredStations.forEach(station => {
        const markerHtml = `
          <div style="display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.3));">
            <div class="marker-thumbnail" style="background: white; padding: 4px; border-radius: 10px; position: relative; transition: all 0.2s ease;">
              <img src="${station.hinh_anh}" style="width: 76px; height: 48px; object-fit: cover; border-radius: 6px; display: block;" />
              <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid white;"></div>
            </div>
            <div style="margin-top: 8px; width: 26px; height: 26px; background: #b83332; border-radius: 50%; border: 2px solid white; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fbbf24" width="14" height="14">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </div>
        `;
        const customThumbnailIcon = window.L.divIcon({ html: markerHtml, className: '', iconSize: [84, 95], iconAnchor: [42, 95], popupAnchor: [0, -34] });
        const marker = window.L.marker([station.lat, station.lng], { icon: customThumbnailIcon }).addTo(map);
        const popupContent = `
          <div style="display: flex; width: 440px; height: 170px; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);">
            <div style="width: 170px; height: 100%; flex-shrink: 0; position: relative;"><img src="${station.hinh_anh}" style="width: 100%; height: 100%; object-fit: cover;" /></div>
            <div style="flex: 1; padding: 14px 16px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <h3 style="font-weight: 800; font-size: 16px; color: #1f2937; margin: 0 0 8px 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${station.ten_diem.toUpperCase()}</h3>
                <div style="display: flex; align-items: flex-start; gap: 6px; margin-bottom: 6px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 1px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  <span style="font-size: 13px; font-weight: 700; color: #dc2626; line-height: 1.3;">${station.don_vi_bau_cu.toUpperCase()} (${station.phuong_xa_cu})</span>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 6px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4b5563" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 1px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg><span style="font-size: 13px; font-weight: 500; color: #4b5563; line-height: 1.3;">TẠI ${station.dia_chi_moi.toUpperCase()}</span></div>
              </div>
              <div style="display: flex; gap: 8px; margin-top: 10px;">
                <button onclick="window.openStationDetails('${station.id}')" style="flex: 1; background-color: #991b1b; color: white; padding: 8px 0; border-radius: 20px; font-weight: 600; border: none; cursor: pointer; font-size: 13px; transition: background 0.2s;">Xem chi tiết</button>
                <button onclick="window.openDirections(${station.lat}, ${station.lng})" style="flex: 1; background-color: rgba(153, 27, 27, 0.1); color: #991b1b; padding: 8px 0; border-radius: 20px; font-weight: 600; border: none; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 4px; transition: background 0.2s;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>Chỉ đường</button>
              </div>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent, { className: 'hover-popup', maxWidth: 450, offset: [0, -4] });
        let closeTimeout; let animTimeout;
        const cancelClose = (m) => { clearTimeout(closeTimeout); clearTimeout(animTimeout); if (m.isPopupOpen()) { const popupNode = m.getPopup()._container; if (popupNode && popupNode.classList.contains('closing')) { popupNode.classList.remove('closing'); if (m._icon) { const thumb = m._icon.querySelector('.marker-thumbnail'); if (thumb) { thumb.style.opacity = '0'; thumb.style.transform = 'scale(0.8)'; thumb.style.pointerEvents = 'none'; } } } } };
        const closeWithAnimation = (m) => { if (!m.isPopupOpen()) return; const popupNode = m.getPopup()._container; if (popupNode) { if (popupNode.classList.contains('closing')) return; popupNode.classList.add('closing'); if (m._icon) { const thumb = m._icon.querySelector('.marker-thumbnail'); if (thumb) { thumb.style.opacity = '1'; thumb.style.transform = 'scale(1)'; thumb.style.pointerEvents = 'auto'; } } animTimeout = setTimeout(() => { m.closePopup(); }, 230); } };
        marker.on('mouseover', function(e) { cancelClose(this); this.openPopup(); });
        marker.on('mouseout', function(e) { closeTimeout = setTimeout(() => closeWithAnimation(this), 100); });
        marker.on('popupopen', function() { const popupNode = this.getPopup()._container; if (popupNode) { popupNode.classList.remove('closing'); popupNode.onmouseenter = () => cancelClose(this); popupNode.onmouseleave = () => { closeTimeout = setTimeout(() => closeWithAnimation(this), 100); }; } if (this._icon) { const thumb = this._icon.querySelector('.marker-thumbnail'); if (thumb) { thumb.style.opacity = '0'; thumb.style.transform = 'scale(0.8)'; thumb.style.pointerEvents = 'none'; } } });
        marker.on('popupclose', function() { clearTimeout(closeTimeout); clearTimeout(animTimeout); if (this._icon) { const thumb = this._icon.querySelector('.marker-thumbnail'); if (thumb) { thumb.style.opacity = '1'; thumb.style.transform = 'scale(1)'; thumb.style.pointerEvents = 'auto'; } } });
        marker.on('click', function() { setActiveStation(station); });
        markersRef.current.push(marker);
      });
    }, [filteredStations, leafletLoaded]);

    useEffect(() => {
      if (!leafletLoaded || !window.L || !mapInstance.current) return;
      const map = mapInstance.current;
      if (tileLayerRef.current) { map.removeLayer(tileLayerRef.current); }
      const tileUrl = isSatellite ? 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' : 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      tileLayerRef.current = window.L.tileLayer(tileUrl, { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }).addTo(map);
      setTimeout(() => map.invalidateSize(), 400);
    }, [isSatellite, leafletLoaded, isSidebarOpen]);

    useEffect(() => {
      if (activeStation && mapInstance.current) { mapInstance.current.flyTo([activeStation.lat, activeStation.lng], 16); }
    }, [activeStation]);

    return (
      <div className="flex-1 relative h-screen z-0 overflow-hidden">
        {!leafletLoaded && (<div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10"><span className="text-gray-500 font-medium">Đang tải bản đồ...</span></div>)}
        <div ref={mapRef} className="w-full h-full" />
        {!isSidebarOpen && leafletLoaded && (
          <button onClick={() => setIsSidebarOpen(true)} className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg font-bold flex items-center gap-2 hover:bg-white border border-gray-200 transition text-[#b83332] animate-in slide-in-from-left-4 duration-300">
            <Menu className="w-6 h-6" /><span className="text-sm uppercase tracking-wider hidden sm:inline">Danh sách</span>
          </button>
        )}
        {leafletLoaded && (
          <button onClick={() => setIsSatellite(!isSatellite)} className="absolute top-4 right-4 z-[400] bg-white/80 backdrop-blur-md p-3 rounded-xl shadow-lg font-bold flex items-center gap-2 hover:bg-white border border-gray-200 transition text-gray-700">
            <Layers className="w-5 h-5 text-red-600" />{isSatellite ? 'Bản đồ Đường' : 'Bản đồ Vệ tinh'}
          </button>
        )}
      </div>
    );
  };

  const StationDetailsModal = () => {
    if (!detailedStation) return null;
    const stationCandidates = mockCandidates.filter(c => c.don_vi_bau_cu.toLowerCase() === detailedStation.don_vi_bau_cu.toLowerCase());
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 md:p-8 animate-in fade-in duration-300">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-full max-h-[95vh] flex flex-col overflow-hidden relative border border-white/20">
          <div className="bg-[#b83332] text-white p-6 flex items-center gap-4 shrink-0 relative border-b-2 border-[#fbbf24]">
            {(viewMode === 'candidates' || selectedCandidate) && (
              <button onClick={() => { if (selectedCandidate) setSelectedCandidate(null); else setViewMode('detail'); }} className="mr-2 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition flex items-center gap-2 group border border-white/20">
                <ArrowLeft className="w-5 h-5 text-[#fbbf24]" /><span className="text-sm font-bold text-[#fbbf24] hidden md:inline">QUAY LẠI</span>
              </button>
            )}
            <div className={`w-14 h-14 bg-[#b83332] rounded-full border-2 border-[#fbbf24] flex items-center justify-center shrink-0 shadow-lg ${(viewMode === 'candidates' || selectedCandidate) ? 'hidden sm:flex' : 'flex'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fbbf24" className="w-8 h-8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            </div>
            <div className="flex-1 space-y-0.5 overflow-hidden">
              <div className="flex items-center gap-2"><span className="w-4 h-[1px] bg-[#fbbf24] shrink-0"></span><p className="text-[#fbbf24] text-xs font-bold uppercase tracking-wider truncate">{detailedStation.don_vi_bau_cu} ({detailedStation.phuong_xa_cu})</p><span className="w-4 h-[1px] bg-[#fbbf24] shrink-0"></span></div>
              <h2 className="text-xl font-bold leading-tight uppercase tracking-tight truncate">{selectedCandidate ? selectedCandidate.ten : viewMode === 'candidates' ? 'DANH SÁCH ỨNG CỬ VIÊN' : detailedStation.ten_diem}</h2>
              {viewMode === 'candidates' && !selectedCandidate ? <p className="text-sm font-bold text-[#fbbf24] uppercase tracking-wide">{stationCandidates.length} ứng cử viên</p> : !selectedCandidate && <p className="text-sm font-medium text-white/90 uppercase truncate">Tại {detailedStation.dia_chi_moi}</p>}
            </div>
            <button onClick={() => { setDetailedStation(null); setSelectedCandidate(null); setViewMode('detail'); setShowQR(false); }} className="p-1.5 bg-white/10 hover:bg-white/30 rounded-full transition ml-2"><X className="w-6 h-6" /></button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 pb-20">
            {selectedCandidate ? (
              <div className="p-6 md:flex gap-8"><img src={selectedCandidate.anh} className="w-48 h-64 object-cover rounded-xl shadow-md border-4 border-white mx-auto md:mx-0" /><div className="flex-1 mt-6 md:mt-0"><h1 className="text-3xl font-bold text-[#b83332] mb-2">{selectedCandidate.ten}</h1><div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-6 bg-white p-4 rounded-xl border border-gray-100"><p><span className="font-bold text-gray-900">Năm sinh:</span> {selectedCandidate.nam_sinh}</p><p><span className="font-bold text-gray-900">Quê quán:</span> {selectedCandidate.que_quan}</p><p><span className="font-bold text-gray-900">Trình độ:</span> {selectedCandidate.trinh_do}</p><p><span className="font-bold text-gray-900">Nghề nghiệp:</span> {selectedCandidate.nghe_nghiep}</p><p className="md:col-span-2"><span className="font-bold text-[#b83332]">Ứng cử tại:</span> {selectedCandidate.don_vi_bau_cu}</p></div><div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"><h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Tiểu sử tóm tắt</h3><p className="text-gray-600 leading-relaxed text-justify">{selectedCandidate.tieu_su}</p></div></div></div>
            ) : viewMode === 'candidates' ? (
              <div className="p-6"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{stationCandidates.map(c => (<div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col"><div className="p-5 flex flex-col items-center"><img src={c.anh} className="w-24 h-24 object-cover rounded-full shadow-md border-2 border-red-100 mb-4" /><h4 className="font-bold text-lg text-gray-900 text-center">{c.ten}</h4><p className="text-sm text-gray-500 mb-2">SN: {c.nam_sinh}</p><p className="text-sm font-bold text-[#b83332] uppercase">{c.nghe_nghiep}</p></div><button onClick={() => setSelectedCandidate(c)} className="w-full py-3 bg-red-50 text-[#b83332] font-bold hover:bg-red-100 transition flex items-center justify-center gap-2 border-t border-red-100">XEM TIỂU SỬ <ChevronRight className="w-4 h-4"/></button></div>))}</div></div>
            ) : (
              <div className="flex flex-col">
                <div className="relative group bg-white border-b border-gray-200 shadow-sm"><div className="aspect-[16/8] md:aspect-[21/9] overflow-hidden"><img src={detailedStation.hinh_anh} className="w-full h-full object-cover" /></div><button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-red-700 shadow-md opacity-0 group-hover:opacity-100 transition"><ChevronLeft className="w-6 h-6" /></button><button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-red-700 shadow-md opacity-0 group-hover:opacity-100 transition"><ChevronRight className="w-6 h-6" /></button><div className="absolute bottom-4 left-4 flex gap-2"><div className="w-16 h-10 border-2 border-red-600 rounded overflow-hidden"><img src={detailedStation.hinh_anh} className="w-full h-full object-cover" /></div></div></div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center"><Users className="w-6 h-6 text-red-700 mb-2" /><p className="text-sm font-bold text-gray-800 mb-2">Ứng cử viên</p><button onClick={() => setViewMode('candidates')} className="px-4 py-1.5 bg-red-50 text-[#b83332] rounded-full text-xs font-bold border border-red-100 hover:bg-red-100 transition uppercase tracking-tighter">Xem danh sách ứng cử viên</button></div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center"><FileText className="w-6 h-6 text-red-700 mb-2" /><p className="text-sm font-bold text-gray-800 mb-2">Quy trình bỏ phiếu</p><button className="px-4 py-1.5 bg-red-50 text-[#b83332] rounded-full text-xs font-bold border border-red-100 hover:bg-red-100 transition uppercase tracking-tighter">Xem quy trình bỏ phiếu</button></div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center"><Clock className="w-6 h-6 text-red-700 mb-2" /><p className="text-sm font-bold text-gray-800 mb-1">Thời gian mở cửa</p><p className="text-[#c28b1e] font-bold text-lg">7:00 - 19:00</p></div>
                </div>
                <div ref={qrRef} className="px-4 mb-8">
                  <button onClick={() => setShowQR(!showQR)} className="w-full p-4 bg-gray-100 rounded-xl border border-gray-300 flex items-center justify-center gap-2 font-bold text-gray-700 hover:bg-gray-200 transition"><QrCode className="w-5 h-5" /> {showQR ? 'Ẩn mã QR điểm bầu cử' : 'Hiện mã QR điểm bầu cử'}{showQR ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</button>
                  {showQR && (<div className="mt-4 p-6 bg-white border border-gray-200 rounded-xl shadow-inner flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-500 ease-out"><div className="p-3 bg-white border border-gray-200 rounded-2xl shadow-lg mb-4"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(detailedStation.ten_diem)}`} alt="QR Code" className="w-40 h-40" /></div><p className="text-gray-500 text-sm mb-4">Quét mã để xem điểm bầu cử này</p><button className="flex items-center gap-2 px-6 py-2 bg-gray-100 rounded-full text-sm font-bold text-gray-700 border border-gray-300 hover:bg-gray-200 transition"><Download className="w-4 h-4" /> Tải mã QR</button></div>)}
                </div>
              </div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-4 md:px-8 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20"><button onClick={() => { setDetailedStation(null); setSelectedCandidate(null); setViewMode('detail'); setShowQR(false); }} className="flex-1 py-3 bg-white border-2 border-[#b83332] text-[#b83332] rounded-xl font-bold hover:bg-red-50 transition flex items-center justify-center gap-2 uppercase tracking-wide"><X className="w-5 h-5" /> Đóng</button><button onClick={() => getDirections(detailedStation.lat, detailedStation.lng)} className="flex-1 py-3 bg-[#b83332] text-white rounded-xl font-bold hover:bg-[#991b1b] transition flex items-center justify-center gap-2 shadow-lg shadow-red-200 uppercase tracking-wide"><Navigation className="w-5 h-5" /> Chỉ đường</button></div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-row font-sans overflow-hidden">
      <style>{`
        .leaflet-container { width: 100%; height: 100%; z-index: 1; }
        .hover-popup { transition: none !important; }
        .hover-popup .leaflet-popup-content-wrapper { padding: 0; background: transparent; border-radius: 12px; shadow: none; animation: floatUpAnim 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .hover-popup .leaflet-popup-tip-container { animation: floatUpAnim 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .hover-popup.closing .leaflet-popup-content-wrapper, .hover-popup.closing .leaflet-popup-tip-container { animation: floatDownAnim 0.25s ease-in forwards; }
        @keyframes floatUpAnim { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes floatDownAnim { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(15px); } }
        .hover-popup .leaflet-popup-content { margin: 0 !important; width: 440px !important; }
        .hover-popup .leaflet-popup-tip { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .hover-popup .leaflet-popup-close-button { display: none !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #9ca3af; }
      `}</style>
      <MapSidebar />
      <MapArea />
      <StationDetailsModal />
    </div>
  );
}