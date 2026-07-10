import { useEffect, useMemo, useRef, useState } from 'react';
import { getPetById } from '../data/defaultData.js';
import PetSprite from './PetSprite.jsx';

const interactionCopy = {
  eat: ['Ngon quá! Cảm ơn nha ♥', 'Cho thêm miếng nữa được hông?'],
  wag: ['Gâu! Đi dạo cùng mình nhé!', 'Mình vui quá, đuôi không dừng được!'],
  rub: ['Meo~ cho mình dụi thêm chút nha.', 'Ở cạnh bạn ấm ghê!'],
  hug: ['Lại đây ôm một cái nào!', 'Gấu ôm là hết buồn liền.'],
  hop: ['Bật cao nè!', 'Bạn bắt kịp mình không?'],
  fly: ['Mình bay một vòng nha!', 'Gió hôm nay đẹp quá!'],
  flare: ['Lửa của mình đang rực sáng!', 'Phượng hoàng tung cánh rồi!', 'Ngọn lửa tri thức đang cháy bùng!'],
  roar: ['Gừ... mình đang canh giữ bìa này!', 'Đừng lo, có rồng ở đây rồi.', 'Tinh vân đang chuyển động quanh ta.'],
  point: ['Ẩu rồi nha ní!', 'Muốn gì? Nói lẹ coi ní!', 'Để tui chỉ mũi phóng lợn vô chỗ đó nha!'],
  awaken: ['...', 'Ta đã thức giấc.', 'Những vì sao đang quan sát ngươi.', 'Tinh vân đã trả lời lời gọi của ta.'],
  splash: ['Bõm! Mát ghê!', 'Theo dòng nước đi nào!'],
  nibble: ['Nhăm nhăm... ngon quá!', 'Cho mình thêm hạt nữa nha!'],
  roll: ['Ụt ịt! Mình lăn một vòng nha!', 'Nằm nghỉ xíu rồi học tiếp!'],
  wave: ['Mình vẫy tay chào bạn nè!', 'Trà đã sẵn sàng, học thôi!'],
  blink: ['Cú đang quan sát rất kỹ.', 'Chớp mắt một cái, nhớ thêm một ý!'],
  spin: ['Theo mình khám phá góc này!', 'Xoay một vòng tìm tài liệu hay!'],
  idle: ['Mình đang ở đây nè!', 'Hôm nay học gì vậy?'],
};

function pick(list = []) {
  return list[Math.floor(Math.random() * Math.max(1, list.length))] || '';
}

function renderPet({ petId, user, focused, speech, actions, isOwner, trigger, onFeed, onPet, setActions, setSpeech, layerClass, index }) {
  const pet = getPetById(petId);
  if (!pet) return null;
  const placement = user.petPlacement?.[petId] || 'cover';
  const accessory = user.petEquipment?.[petId] || '';
  const stat = user.petStats?.[petId] || { happiness: 80 };
  const size = pet.species === 'nebulaElder' ? 'legendary' : ['dragonAdult', 'phoenixAdult'].includes(pet.species) ? 'hero' : 'cover';
  return <div key={petId} className={`cover-pet-wrap ${layerClass} pet-slot-${index + 1} pet-place-${placement} pet-wrap-${pet.species} ${focused === petId ? 'focused' : ''} ${pet.species === 'nebulaElder' ? 'pet-legendary-stage' : ''}`}>
    <button className="cover-pet-button" onClick={() => trigger(petId)} title={`Tương tác với ${pet.name}`}>
      <PetSprite petId={petId} accessoryId={accessory} size={size} mood={stat.happiness >= 80 ? 'happy' : 'normal'} action={actions[petId] || (pet.species === 'nebulaElder' ? 'awaken' : 'idle')}/>
    </button>
    {speech[petId] && <span className={`pet-speech pet-speech-${pet.species}`}>{speech[petId]}</span>}
    {focused === petId && isOwner && pet.species !== 'nebulaElder' && <div className="pet-quick-actions">
      <button onClick={(event) => { event.stopPropagation(); onFeed?.(petId); setActions((prev) => ({ ...prev, [petId]: 'eat' })); setSpeech((prev) => ({ ...prev, [petId]: pick(interactionCopy.eat) })); }}>🍪 Cho ăn</button>
      <button onClick={(event) => { event.stopPropagation(); trigger(petId, pet.interaction || 'idle'); onPet?.(petId, true); }}>🤍 Tương tác</button>
    </div>}
  </div>;
}

export default function CoverPets({ user, isOwner, onFeed, onPet }) {
  const [focused, setFocused] = useState('');
  const [speech, setSpeech] = useState({});
  const [actions, setActions] = useState({});
  const timeouts = useRef([]);
  const active = useMemo(() => (user?.activePets || []).slice(0, 2), [user?.activePets]);
  const elderPets = useMemo(() => active.filter((petId) => getPetById(petId)?.species === 'nebulaElder'), [active]);
  const regularPets = useMemo(() => active.filter((petId) => getPetById(petId)?.species !== 'nebulaElder'), [active]);

  useEffect(() => {
    if (!active.length || !user?.petsVisible) return undefined;
    const timer = window.setInterval(() => {
      const petId = pick(active);
      const pet = getPetById(petId);
      if (!pet) return;
      const action = pet.species === 'nebulaElder' ? 'awaken' : (pet.interaction || 'idle');
      const message = pick(pet.phrases?.length ? pet.phrases : interactionCopy[action] || interactionCopy.idle);
      setSpeech((prev) => ({ ...prev, [petId]: message }));
      setActions((prev) => ({ ...prev, [petId]: action }));
      const clearTimer = window.setTimeout(() => {
        setSpeech((prev) => ({ ...prev, [petId]: '' }));
        setActions((prev) => ({ ...prev, [petId]: pet.species === 'nebulaElder' ? 'idle' : 'idle' }));
      }, pet.species === 'nebulaElder' ? 5400 : 3600);
      timeouts.current.push(clearTimer);
    }, 9800);
    return () => {
      window.clearInterval(timer);
      timeouts.current.forEach((value) => window.clearTimeout(value));
      timeouts.current = [];
    };
  }, [active, user?.petsVisible]);

  if (!user?.petsVisible || !active.length) return null;

  function trigger(petId, preferredAction) {
    const pet = getPetById(petId);
    if (!pet) return;
    const action = preferredAction || (pet.species === 'nebulaElder' ? 'awaken' : pet.interaction || 'idle');
    setFocused((value) => value === petId ? '' : petId);
    setActions((prev) => ({ ...prev, [petId]: action }));
    setSpeech((prev) => ({ ...prev, [petId]: pick(interactionCopy[action] || pet.phrases || interactionCopy.idle) }));
    onPet?.(petId, true);
    const clearTimer = window.setTimeout(() => {
      setActions((prev) => ({ ...prev, [petId]: 'idle' }));
      setSpeech((prev) => ({ ...prev, [petId]: '' }));
    }, action === 'awaken' ? 6200 : 3300);
    timeouts.current.push(clearTimer);
  }

  return <>
    {!!elderPets.length && <div className="cover-pets-layer cover-pets-back" aria-label="Thú cưng nền">
      {elderPets.map((petId, index) => renderPet({ petId, user, focused, speech, actions, isOwner, trigger, onFeed, onPet, setActions, setSpeech, layerClass: 'pet-layer-back', index }))}
    </div>}
    {!!regularPets.length && <div className="cover-pets-layer cover-pets-front" aria-label="Thú cưng đang hoạt động">
      {regularPets.map((petId, index) => renderPet({ petId, user, focused, speech, actions, isOwner, trigger, onFeed, onPet, setActions, setSpeech, layerClass: 'pet-layer-front', index }))}
    </div>}
  </>;
}
