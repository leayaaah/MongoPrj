// Demo data & helpers
const demoTrips = [
  {
    tripId: 'CH-20251030-01',
    train: 'TR-1001',
    route: 'Hà Nội → Hải Phòng',
    depart: '2025-10-30 05:20',
    arrive: '2025-10-30 07:40',
    price: 120000,
    status: 'Đã lên lịch',
    seatMap: generateSeatMap(3, 8, ['1-2','2-5','3-7'])
  },
  {
    tripId: 'CH-20251030-02',
    train: 'TR-1005',
    route: 'Hà Nội → Thanh Hóa',
    depart: '2025-10-30 06:00',
    arrive: '2025-10-30 09:00',
    price: 90000,
    status: 'Chờ',
    seatMap: generateSeatMap(2, 8, ['1-1','1-3'])
  }
];

function generateSeatMap(carriages, cols, occupiedList=[]){
  const res = [];
  for(let c=1;c<=carriages;c++){
    const seats = [];
    for(let r=1;r<=cols;r++){
      const seatId = `C${c}-S${r}`;
      const occupied = occupiedList.includes(`${c}-${r}`);
      seats.push({ id: seatId, occupied });
    }
    res.push({ carriage: `Toa ${c}`, seats });
  }
  return res;
}

// DOM refs
const resultsList = document.getElementById('resultsList');
const searchForm = document.getElementById('searchForm');
const summaryPassengers = document.getElementById('summaryPassengers');
const summaryTrip = document.getElementById('summaryTrip');
const summaryPrice = document.getElementById('summaryPrice');
const proceedBtn = document.getElementById('proceedBtn');

const carriagesArea = document.getElementById('carriagesArea');
const seatTripLabel = document.getElementById('seatTripLabel');
const selectedCountEl = document.getElementById('selectedCount');
const seatSubtotalEl = document.getElementById('seatSubtotal');
const confirmSeatsBtn = document.getElementById('confirmSeatsBtn');

const confirmTripDetails = document.getElementById('confirmTripDetails');
const confirmTotal = document.getElementById('confirmTotal');
const bkName = document.getElementById('bkName');
const bkPhone = document.getElementById('bkPhone');
const bkEmail = document.getElementById('bkEmail');
const finalizeBtn = document.getElementById('finalizeBtn');

const ticketIdEl = document.getElementById('ticketId');
const ticketNameEl = document.getElementById('ticketName');
const ticketTripEl = document.getElementById('ticketTrip');
const ticketSeatsEl = document.getElementById('ticketSeats');
const ticketTotalEl = document.getElementById('ticketTotal');

const addTripForm = document.getElementById('addTripForm');
const newTripId = document.getElementById('newTripId');
const newTripTrain = document.getElementById('newTripTrain');
const newTripRoute = document.getElementById('newTripRoute');
const newTripPrice = document.getElementById('newTripPrice');

let chosenTrip = null;
let selectedSeats = [];

function formatVND(n){ return '₫ ' + n.toLocaleString('vi-VN'); }

function renderResults(trips){
  resultsList.innerHTML = '';
  if(!trips || trips.length===0){
    resultsList.innerHTML = '<div class="alert alert-warning mb-0">Không tìm thấy chuyến.</div>';
    return;
  }
  trips.forEach(t => {
    const div = document.createElement('div');
    div.className = 'card trip-card';
    div.innerHTML = `
      <div class="card-body d-md-flex justify-content-between align-items-center gap-3">
        <div>
          <h6 class="mb-1">${t.route}</h6>
          <div class="small-muted">Mã: ${t.tripId} — Tàu: ${t.train}</div>
          <div class="small-muted mt-1">Khởi hành: ${t.depart} — Đến: ${t.arrive}</div>
        </div>
        <div class="text-md-end mt-2 mt-md-0">
          <div class="h5 mb-1">${formatVND(t.price)}</div>
          <div class="small-muted mb-2">${t.status}</div>
          <div class="d-flex gap-2 justify-content-end">
            <button class="btn btn-sm btn-outline-primary btn-details">Chi tiết</button>
            <button class="btn btn-sm btn-primary btn-select-seat">Chọn chỗ / Đặt vé</button>
          </div>
        </div>
      </div>
    `;
    div.querySelector('.btn-select-seat').addEventListener('click', ()=> openSeatModal(t));
    div.querySelector('.btn-details').addEventListener('click', ()=> {
      alert(`Chi tiết chuyến:\n${t.tripId}\n${t.route}\nGiá: ${formatVND(t.price)}\nTrạng thái: ${t.status}`);
    });
    resultsList.appendChild(div);
  });
}

function openSeatModal(trip){
  chosenTrip = trip;
  selectedSeats = [];
  seatTripLabel.textContent = `${trip.tripId} — ${trip.route}`;
  carriagesArea.innerHTML = '';
  const seatMap = trip.seatMap || generateSeatMap(2,8,[]);
  seatMap.forEach(car => {
    const cdiv = document.createElement('div');
    cdiv.className = 'carriage';
    cdiv.innerHTML = `<div class="mb-2"><strong>${car.carriage}</strong></div>`;
    const seatsWrap = document.createElement('div');
    seatsWrap.className = 'd-flex flex-wrap';
    car.seats.forEach(s => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'seat';
      btn.classList.add(s.occupied ? 'occupied' : 'available');
      btn.textContent = s.id.split('-')[1];
      if(!s.occupied){
        btn.addEventListener('click', () => toggleSeatSelection(s.id, btn));
      }
      seatsWrap.appendChild(btn);
    });
    cdiv.appendChild(seatsWrap);
    carriagesArea.appendChild(cdiv);
  });
  updateSeatSummary();
  new bootstrap.Modal(document.getElementById('seatModal')).show();
}

function toggleSeatSelection(seatId, btn){
  const idx = selectedSeats.indexOf(seatId);
  if(idx === -1){
    selectedSeats.push(seatId);
    btn.classList.remove('available');
    btn.classList.add('selected');
  } else {
    selectedSeats.splice(idx,1);
    btn.classList.remove('selected');
    btn.classList.add('available');
  }
  updateSeatSummary();
}

function updateSeatSummary(){
  const count = selectedSeats.length;
  selectedCountEl.textContent = count;
  const subtotal = (chosenTrip ? chosenTrip.price : 0) * count;
  seatSubtotalEl.textContent = formatVND(subtotal);
  confirmSeatsBtn.disabled = count === 0;
}

confirmSeatsBtn.addEventListener('click', () =>{
  const count = selectedSeats.length;
  summaryPassengers.textContent = document.getElementById('passengers').value || '1';
  summaryTrip.textContent = `${chosenTrip.tripId} — ${chosenTrip.route}`;
  const total = chosenTrip.price * count;
  summaryPrice.textContent = formatVND(total);
  proceedBtn.disabled = false;
  bootstrap.Modal.getInstance(document.getElementById('seatModal')).hide();
});

proceedBtn.addEventListener('click', () =>{
  confirmTripDetails.textContent = `${chosenTrip ? chosenTrip.tripId + ' — ' + chosenTrip.route : 'Chưa chọn'}`;
  const count = selectedSeats.length;
  confirmTotal.textContent = formatVND((chosenTrip ? chosenTrip.price : 0) * count);
});

finalizeBtn.addEventListener('click', () =>{
  if(!bkName.value || !bkPhone.value){
    alert('Vui lòng nhập tên và số điện thoại.');
    return;
  }
  const ticketId = 'V-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.floor(Math.random()*900+100);
  ticketIdEl.textContent = ticketId;
  ticketNameEl.textContent = bkName.value;
  ticketTripEl.textContent = chosenTrip ? chosenTrip.tripId + ' — ' + chosenTrip.route : 'Chưa chọn';
  ticketSeatsEl.textContent = selectedSeats.join(', ') || 'Chưa có';
  ticketTotalEl.textContent = confirmTotal.textContent;
  bootstrap.Modal.getInstance(document.getElementById('confirmBookingModal')).hide();
  new bootstrap.Modal(document.getElementById('ticketModal')).show();

  selectedSeats = [];
  chosenTrip = null;
  summaryPassengers.textContent = '0';
  summaryTrip.textContent = 'Chưa có';
  summaryPrice.textContent = '₫ 0';
  proceedBtn.disabled = true;
  bkName.value = ''; bkPhone.value = ''; bkEmail.value = '';
  renderResults([]);
});

searchForm.addEventListener('submit', (e) =>{
  e.preventDefault();
  const from = document.getElementById('from').value.trim();
  const to = document.getElementById('to').value.trim();
  const passengers = document.getElementById('passengers').value;
  summaryPassengers.textContent = passengers;
  const filtered = demoTrips.filter(t => {
    return t.route.toLowerCase().includes(from.toLowerCase()) && t.route.toLowerCase().includes(to.toLowerCase());
  });
  renderResults(filtered.length ? filtered : demoTrips);
});

document.getElementById('sampleSearchBtn').addEventListener('click', () =>{
  document.getElementById('from').value = 'Hà Nội';
  document.getElementById('to').value = 'Hải Phòng';
  document.getElementById('date').value = new Date().toISOString().slice(0,10);
  document.getElementById('passengers').value = 1;
  searchForm.dispatchEvent(new Event('submit'));
});

// Add trip (demo)
document.getElementById('saveTripBtn').addEventListener('click', () =>{
  const id = newTripId.value.trim();
  const train = newTripTrain.value.trim();
  const route = newTripRoute.value.trim();
  const price = parseInt(newTripPrice.value, 10) || 0;
  if(!id || !train || !route) {
    alert('Vui lòng điền đủ thông tin chuyến.');
    return;
  }
  demoTrips.push({
    tripId: id,
    train,
    route,
    depart: '—',
    arrive: '—',
    price,
    status: 'Đã thêm (demo)',
    seatMap: generateSeatMap(2,8,[])
  });
  bootstrap.Modal.getInstance(document.getElementById('addTripModal')).hide();
  renderResults([demoTrips[demoTrips.length-1]]);
  newTripId.value=''; newTripTrain.value=''; newTripRoute.value=''; newTripPrice.value='100000';
});

// initial
renderResults([]);
