import { useMemo, useState } from 'react';
import { Eye, EyeOff, Heart, MapPin, ShoppingBag, Sparkles, Utensils } from 'lucide-react';
import PetSprite from './PetSprite.jsx';

export default function PetBag({ user, petCatalog, petAccessories, isOwner, actions }) {
  const [tab, setTab] = useState('pets');
  const [selectedPetId, setSelectedPetId] = useState((user.activePets || [])[0] || (user.ownedPets || [])[0] || '');
  const ownedPets = user.ownedPets || [];
  const activePets = (user.activePets || []).slice(0, 2);
  const ownedAccessories = user.ownedPetAccessories || [];
  const selectedPet = useMemo(() => petCatalog.find((pet) => pet.id === selectedPetId), [petCatalog, selectedPetId]);
  const selectedStat = user.petStats?.[selectedPetId] || { level: 1, hunger: 70, happiness: 80 };

  return <section className="pet-bag-v21">
    <div className="pet-bag-head">
      <div><h2>🐾 Túi thú cưng</h2><p>Sưu tầm không giới hạn, nhưng chỉ mang tối đa <b>2 bạn nhỏ</b> ra ảnh bìa.</p></div>
      <span className="active-pet-count">{activePets.length}/2 đang hoạt động</span>
    </div>
    <div className="pet-bag-tabs"><button className={tab === 'pets' ? 'active' : ''} onClick={() => setTab('pets')}>Thú cưng</button><button className={tab === 'accessories' ? 'active' : ''} onClick={() => setTab('accessories')}>Phụ kiện</button></div>

    {tab === 'pets' && <>
      <div className="pet-grid-v21 custom-scroll">{petCatalog.map((pet) => {
        const owned = ownedPets.includes(pet.id);
        const active = activePets.includes(pet.id);
        const accessory = user.petEquipment?.[pet.id];
        return <article key={pet.id} className={`pet-card-v21 ${owned ? 'owned' : 'locked'} ${active ? 'active' : ''} ${selectedPetId === pet.id ? 'selected' : ''}`} onClick={() => owned && setSelectedPetId(pet.id)}>
          <div className="pet-card-art"><PetSprite petId={pet.id} accessoryId={accessory} size="card"/></div>
          <div className="pet-card-copy"><b>{pet.name}</b><small className={`pet-rarity rarity-${pet.rarity.toLowerCase().replaceAll(' ','-')}`}>{pet.rarity}</small><p>{pet.description}</p></div>
          {isOwner && (owned ? <button className={active ? 'pet-active-btn' : ''} onClick={(event) => { event.stopPropagation(); setSelectedPetId(pet.id); actions.toggleActivePet(pet.id); }}>{active ? '✓ Đang ngoài bìa' : 'Mang ra bìa'}</button> : <button onClick={(event) => { event.stopPropagation(); actions.buyPet(pet.id); }}>{pet.price === 0 ? 'Nhận miễn phí' : `Mua ${pet.price} credit`}</button>)}
        </article>;
      })}</div>
    </>}

    {tab === 'accessories' && <div className="pet-accessory-grid-v21 custom-scroll">{petAccessories.map((item) => {
      const owned = ownedAccessories.includes(item.id);
      const equipped = selectedPetId && user.petEquipment?.[selectedPetId] === item.id;
      return <article key={item.id} className={`pet-accessory-card ${owned ? 'owned' : 'locked'} ${equipped ? 'active' : ''}`}>
        <span>{item.icon}</span><div><b>{item.name}</b><small>{item.description}</small></div>
        {isOwner && (owned ? <button disabled={!selectedPetId} onClick={() => actions.equipPetAccessory(selectedPetId, equipped ? '' : item.id)}>{equipped ? '✓ Đang dùng' : selectedPetId ? 'Trang bị' : 'Chọn thú cưng'}</button> : <button onClick={() => actions.buyPetAccessory(item.id)}>Mua {item.price} credit</button>)}
      </article>;
    })}</div>}

    {selectedPet && ownedPets.includes(selectedPet.id) && <div className="pet-control-v21">
      <div className="selected-pet-summary"><PetSprite petId={selectedPet.id} accessoryId={user.petEquipment?.[selectedPet.id]} size="card"/><div><b>{selectedPet.name} · Lv.{selectedStat.level}</b><small>{selectedPet.phrase}</small><div className="pet-meter"><span>Đói <i><em style={{ width:`${selectedStat.hunger}%` }}/></i>{selectedStat.hunger}%</span><span>Vui <i><em style={{ width:`${selectedStat.happiness}%` }}/></i>{selectedStat.happiness}%</span></div></div></div>
      {isOwner && <div className="pet-control-actions"><button onClick={() => actions.feedPet(selectedPet.id)}><Utensils size={15}/>Cho ăn</button><button onClick={() => actions.petPet(selectedPet.id)}><Heart size={15}/>Vuốt ve</button><button onClick={() => actions.togglePetsVisibility()}>{user.petsVisible ? <EyeOff size={15}/> : <Eye size={15}/>} {user.petsVisible ? 'Ẩn thú cưng' : 'Hiện thú cưng'}</button></div>}
      {isOwner && activePets.includes(selectedPet.id) && <div className="pet-placement-row"><span><MapPin size={15}/>Vị trí:</span>{[['cover','Đi lại ở bìa'],['avatar','Treo cạnh avatar'],['buttons','Ngồi cạnh nút']].map(([key,label]) => <button key={key} className={(user.petPlacement?.[selectedPet.id] || 'cover') === key ? 'active' : ''} onClick={() => actions.setPetPlacement(selectedPet.id,key)}>{label}</button>)}</div>}
      <div className="pet-tip"><Sparkles size={15}/><span>Thú cưng đang ở trong túi sẽ không biến mất. Bạn có thể đổi 2 thú cưng hoạt động bất cứ lúc nào.</span></div>
    </div>}
  </section>;
}
