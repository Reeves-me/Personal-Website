let events = [];
let nextEventId = 1;
let editingEventId = null;

function createEventCard(eventDetails) {
  const event_element = document.createElement('div');
  event_element.className = 'event-card';
  if (eventDetails.id === undefined) eventDetails.id = nextEventId++;
  event_element.dataset.eventId = eventDetails.id;
  event_element.style.cursor = 'pointer';
  event_element.addEventListener('click', function (e) {
    e.stopPropagation();
    openEditModal(eventDetails.id);
  });

  const nameLabel = document.createElement('div');
  nameLabel.className = 'label';
  nameLabel.textContent = 'Event Name:';
  const nameValue = document.createElement('div');
  nameValue.className = 'value';
  nameValue.textContent = eventDetails.name || '(no title)';

  const timeLabel = document.createElement('div');
  timeLabel.className = 'label';
  timeLabel.textContent = 'Event Time:';
  const timeValue = document.createElement('div');
  timeValue.className = 'value';
  timeValue.textContent = eventDetails.time || '';

  const modLabel = document.createElement('div');
  modLabel.className = 'label';
  modLabel.textContent = 'Event Modality:';
  const modValue = document.createElement('div');
  modValue.className = 'value';
  modValue.textContent = eventDetails.modality || '';

  const locLabel = document.createElement('div');
  locLabel.className = 'label';
  locLabel.textContent = 'Event Location:';
  const locValue = document.createElement('div');
  locValue.className = 'value';
  locValue.textContent = eventDetails.location || '';

  const attLabel = document.createElement('div');
  attLabel.className = 'label';
  attLabel.textContent = 'Attendees:';
  const attValue = document.createElement('div');
  attValue.className = 'value';
  attValue.textContent = eventDetails.attendees || '';

  event_element.appendChild(nameLabel);
  event_element.appendChild(nameValue);
  event_element.appendChild(timeLabel);
  event_element.appendChild(timeValue);
  event_element.appendChild(modLabel);
  event_element.appendChild(modValue);

  if (eventDetails.location) {
    event_element.appendChild(locLabel);
    event_element.appendChild(locValue);
  }

  if (eventDetails.attendees) {
    event_element.appendChild(attLabel);
    event_element.appendChild(attValue);
  }

  return event_element;
}

function addEventToCalendarUI(eventInfo) {
  if (!eventInfo || !eventInfo.weekday) return;
  const dayId = eventInfo.weekday.toLowerCase();
  const dayCol = document.getElementById(dayId);
  if (!dayCol) return;
  if (eventInfo.id === undefined) eventInfo.id = nextEventId++;
  const card = createEventCard(eventInfo);
  const color = (document.getElementById("event_color") || {value: ''}).value;
  if (color == "red") card.style.backgroundColor = "red";
  else if (color == "purple") card.style.backgroundColor = "purple";
  else card.style.backgroundColor = "blue";
  const header = dayCol.querySelector('.day');
  if (header) header.insertAdjacentElement('afterend', card);
  else dayCol.appendChild(card);
}

function updateEventOnCalendarUI(eventObj) {
  const selector = `.event-card[data-event-id="${eventObj.id}"]`;
  const oldCard = document.querySelector(selector);
  if (oldCard && oldCard.parentElement) {
    const newCard = createEventCard(eventObj);
    oldCard.parentElement.replaceChild(newCard, oldCard);
  } else {
    addEventToCalendarUI(eventObj);
  }
}

function openEditModal(eventId) {
  const ev = events.find(e => e.id === Number(eventId));
  if (!ev) return console.warn('Event not found for edit', eventId);
  document.getElementById('event_name').value = ev.name || '';
  document.getElementById('event_weekday').value = ev.weekday || '';
  document.getElementById('event_time').value = ev.time || '';
  if (document.getElementById('event_color')) document.getElementById('event_color').value = ev.color || '';
  document.getElementById('event_modality').value = ev.modality || '';
  updateLocationOptions();
  document.getElementById('event_location').value = ev.location || '';
  document.getElementById('event_remote_url').value = ev.url || '';
  document.getElementById('event_attendees').value = ev.attendees || '';
  const modalEl = document.getElementById('exampleModal');
  modalEl.dataset.editingId = ev.id;
  editingEventId = ev.id;
  if (modalEl && typeof bootstrap !== 'undefined') {
    const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
    bsModal.show();
  }
}

function saveEvent() {
  const form = document.querySelector('#exampleModal form');
  if (!form) return;
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  try {
    const name = (document.getElementById('event_name').value || '').trim();
    const weekdayRaw = (document.getElementById('event_weekday').value || '');
    const time = (document.getElementById('event_time').value || '');
    const modality = (document.getElementById('event_modality').value || '');
    const location = (document.getElementById('event_location').value || '').trim();
    const url = (document.getElementById('event_remote_url').value || '').trim();
    const attendees = (document.getElementById('event_attendees').value || '').trim();
    const color = (document.getElementById('event_color') && document.getElementById('event_color').value) || '';
    if (!weekdayRaw) { alert('Please select a weekday.'); return; }
    const weekday = weekdayRaw.toLowerCase();
    const modalEl = document.getElementById('exampleModal');
    const editingId = modalEl.dataset.editingId;
    if (editingId !== undefined && editingId !== "") {
      const idNum = Number(editingId);
      const existingIndex = events.findIndex(e => e.id === idNum);
      if (existingIndex !== -1) {
        const eventObj = { id: idNum, name, weekday, time, modality, location, url, attendees, color };
        events[existingIndex] = eventObj;
        updateEventOnCalendarUI(eventObj);
      } else {
        const eventObj = { id: nextEventId++, name, weekday, time, modality, location, url, attendees, color };
        events.push(eventObj);
        addEventToCalendarUI(eventObj);
      }
      delete modalEl.dataset.editingId;
    } else {
      const eventObj = { id: nextEventId++, name, weekday, time, modality, location, url, attendees, color };
      events.push(eventObj);
      addEventToCalendarUI(eventObj);
    }
    if (modalEl && typeof bootstrap !== 'undefined') {
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.hide();
    }
    form.reset();
    document.getElementById('location_group').style.display = 'none';
    document.getElementById('remote_url_group').style.display = 'none';
    form.classList.remove('was-validated');
  } catch (err) {
    console.error('saveEvent error:', err);
  }
}

function updateLocationOptions(){
  const modality = document.getElementById("event_modality").value;
  const locationGroup = document.getElementById("location_group");
  const remoteGroup = document.getElementById("remote_url_group");
  const remoteInput = document.getElementById("event_remote_url");
  if (modality === "In-Person") {
    locationGroup.style.display = "block";
    remoteGroup.style.display = "none";
    remoteInput.removeAttribute("required");
    remoteInput.value = "";
  } else if (modality === "Online") {
    locationGroup.style.display = "none";
    remoteGroup.style.display = "block";
    remoteInput.setAttribute("required","true");
  } else {
    locationGroup.style.display = "none";
    remoteGroup.style.display = "none";
    remoteInput.removeAttribute("required");
    remoteInput.value = "";
  }
}
