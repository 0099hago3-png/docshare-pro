import { Gift, Search, Send, Sparkles, Trophy, WalletCards } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import BotanicalHero from '../components/BotanicalHero.jsx';
import EmptyState from '../components/EmptyState.jsx';
import GiftBurst from '../components/GiftBurst.jsx';
import Loading from '../components/Loading.jsx';
import { useApp } from '../context/AppContext.jsx';
import { GIFT_TIERS, getGiftTier } from '../lib/giftTiers.js';
import { formatDateTime, formatNumber, getProfileName, normalizeError } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';
import '../comment-gift-system.css';

export default function GiftVault() {
  const { currentUser, refreshProfile, toast } = useApp();
  const [gifts, setGifts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [people, setPeople] = useState([]);
  const [query, setQuery] = useState('');
  const [receiver, setReceiver] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [effectGift, setEffectGift] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('all');

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const [giftResult, transactionResult] = await Promise.all([
        supabase
          .from('gifts')
          .select('*')
          .eq('active', true)
          .order('sort_order'),
        supabase
          .from('gift_transactions')
          .select(`
            *,
            gifts(name,icon,credit_price),
            sender:sender_id(id,full_name,username,avatar_path),
            receiver:receiver_id(id,full_name,username,avatar_path)
          `)
          .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
          .order('created_at', { ascending: false })
          .limit(80),
      ]);

      if (giftResult.error) throw giftResult.error;
      if (transactionResult.error) throw transactionResult.error;

      setGifts(giftResult.data || []);
      setSelected((current) => {
        if (current && giftResult.data?.some((gift) => gift.id === current.id)) return current;
        return giftResult.data?.[0] || null;
      });
      setTransactions(transactionResult.data || []);
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser.id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const keyword = query.trim();

      if (!keyword || receiver) {
        setPeople([]);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id,full_name,username,email,avatar_path,premium,verified')
        .neq('id', currentUser.id)
        .or(`full_name.ilike.%${keyword}%,username.ilike.%${keyword}%,email.ilike.%${keyword}%`)
        .limit(8);

      if (error) {
        toast(normalizeError(error), 'error');
        return;
      }

      setPeople(data || []);
    }, 280);

    return () => window.clearTimeout(timer);
  }, [currentUser.id, query, receiver, toast]);

  const summary = useMemo(() => {
    return transactions.reduce((result, item) => {
      if (item.sender_id === currentUser.id) {
        result.sentCount += 1;
        result.sentCredit += Number(item.cost_credit || 0);
      }

      if (item.receiver_id === currentUser.id) {
        result.receivedCount += 1;
        result.receivedCredit += Number(item.receiver_credit || 0);
      }

      return result;
    }, {
      sentCount: 0,
      sentCredit: 0,
      receivedCount: 0,
      receivedCredit: 0,
    });
  }, [currentUser.id, transactions]);

  const receivedCollection = useMemo(() => {
    const map = new Map();

    transactions
      .filter((item) => item.receiver_id === currentUser.id)
      .forEach((item) => {
        const key = item.gift_id || item.gifts?.name || item.id;
        const current = map.get(key) || {
          id: key,
          icon: item.gifts?.icon || '🎁',
          name: item.gifts?.name || 'Quà tặng',
          count: 0,
          credit: 0,
          lastAt: item.created_at,
        };

        current.count += 1;
        current.credit += Number(item.receiver_credit || 0);

        if (new Date(item.created_at) > new Date(current.lastAt)) {
          current.lastAt = item.created_at;
        }

        map.set(key, current);
      });

    return [...map.values()].sort((a, b) => (
      b.count - a.count
      || b.credit - a.credit
      || new Date(b.lastAt) - new Date(a.lastAt)
    ));
  }, [currentUser.id, transactions]);

  const filteredTransactions = useMemo(() => {
    if (historyFilter === 'received') {
      return transactions.filter((item) => item.receiver_id === currentUser.id);
    }

    if (historyFilter === 'sent') {
      return transactions.filter((item) => item.sender_id === currentUser.id);
    }

    return transactions;
  }, [currentUser.id, historyFilter, transactions]);

  async function send() {
    if (!receiver || !selected) {
      toast('Hãy chọn người nhận và món quà.', 'error');
      return;
    }

    try {
      setBusy(true);

      const { data, error } = await supabase.rpc('send_gift', {
        p_gift_id: selected.id,
        p_receiver_id: receiver.id,
        p_target_type: 'profile',
        p_target_id: receiver.id,
      });

      if (error) throw error;

      if (!data?.ok) {
        if (data?.code === 'INSUFFICIENT_CREDIT') {
          throw new Error(`Không đủ credit. Bạn cần ${formatNumber(data?.price || selected.credit_price)} credit.`);
        }

        throw new Error('Không thể gửi quà.');
      }

      toast(`Đã gửi ${selected.name} tới ${getProfileName(receiver)}.`);
      setEffectGift({
        gift: selected,
        receiverName: getProfileName(receiver),
      });
      setReceiver(null);
      setQuery('');
      setPeople([]);
      await refreshProfile();
      await load();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading label="Đang tải kho quà..." />;

  return (
    <div className="page gift-vault-page">
      <BotanicalHero
        compact
        eyebrow="TRI ÂN CỘNG ĐỒNG"
        title="Kho quà DocShare"
        description="Mỗi cấp bậc quà có hiệu ứng riêng. Quà càng cao cấp, hiệu ứng càng nổi bật."
      />

      <div className="gift-vault-summary">
        <article className="botanical-card">
          <span><Gift size={18} /></span>
          <div>
            <small>Quà đã gửi</small>
            <strong>{formatNumber(summary.sentCount)}</strong>
            <p>{formatNumber(summary.sentCredit)} credit</p>
          </div>
        </article>

        <article className="botanical-card">
          <span><Sparkles size={18} /></span>
          <div>
            <small>Quà đã nhận</small>
            <strong>{formatNumber(summary.receivedCount)}</strong>
            <p>+{formatNumber(summary.receivedCredit)} credit</p>
          </div>
        </article>

        <article className="botanical-card">
          <span><WalletCards size={18} /></span>
          <div>
            <small>Số dư hiện tại</small>
            <strong>{formatNumber(currentUser?.wallet?.credit_balance ?? currentUser?.credit_balance ?? 0)}</strong>
            <p>credit</p>
          </div>
        </article>
      </div>

      <section className="gift-received-v78 botanical-card">
        <div className="gift-received-v78__heading">
          <div>
            <span>QUÀ ĐÃ ĐƯỢC TẶNG</span>
            <h2><Sparkles size={21} /> Bộ sưu tập quà bạn đã nhận</h2>
            <p>Mỗi món quà được gom lại để bạn xem số lượng và tổng credit đã nhận.</p>
          </div>

          <strong>{formatNumber(summary.receivedCount)} lượt quà</strong>
        </div>

        {receivedCollection.length ? (
          <div className="gift-received-v78__grid">
            {receivedCollection.map((item) => {
              const tier = getGiftTier(item.credit);

              return (
                <article
                  key={item.id}
                  className={`gift-received-v78__item gift-received-v78__item--${tier.key}`}
                >
                  <span className="gift-received-v78__icon">{item.icon}</span>

                  <div>
                    <strong>{item.name}</strong>
                    <small>Nhận {formatNumber(item.count)} lần</small>
                    <b>+{formatNumber(item.credit)} credit</b>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Bạn chưa nhận được quà"
            description="Những món quà được tặng sẽ xuất hiện thành bộ sưu tập tại đây."
          />
        )}
      </section>

      <section className="gift-tier-guide botanical-card">
        <div className="gift-tier-guide__heading">
          <div>
            <span className="gift-tier-guide__eyebrow">CẤP BẬC HIỆU ỨNG</span>
            <h2>Quà càng quý, hiệu ứng càng nổi bật</h2>
          </div>
        </div>

        <div className="gift-tier-guide__grid">
          {GIFT_TIERS.map((tier) => (
            <article key={tier.key} className={`gift-tier-guide__item gift-tier-guide__item--${tier.key}`}>
              <span>{tier.label}</span>
              <strong>
                {Number.isFinite(tier.max)
                  ? `${formatNumber(tier.min)} - ${formatNumber(tier.max)} credit`
                  : `Từ ${formatNumber(tier.min)} credit`}
              </strong>
              <p>{tier.description}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="gift-page-layout gift-page-layout--enhanced">
        <section className="gift-send-card botanical-card">
          <h2><Gift size={23} /> Chọn quà và người nhận</h2>

          <label>
            Tìm người nhận
            <div className="input-icon">
              <Search size={17} />
              <input
                value={query}
                onChange={(event) => {
                  setReceiver(null);
                  setQuery(event.target.value);
                }}
                placeholder="Tên, username hoặc email..."
              />
            </div>
          </label>

          {people.length > 0 && (
            <div className="people-search-results">
              {people.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => {
                    setReceiver(person);
                    setPeople([]);
                    setQuery(getProfileName(person));
                  }}
                >
                  <Avatar profile={person} size={34} />
                  <span>
                    <strong>{getProfileName(person)}</strong>
                    <small>@{person.username}</small>
                  </span>
                </button>
              ))}
            </div>
          )}

          {receiver && (
            <div className="selected-person">
              <Avatar profile={receiver} size={42} />
              <div>
                <small>Người nhận</small>
                <strong>{getProfileName(receiver)}</strong>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReceiver(null);
                  setQuery('');
                }}
              >
                Đổi người
              </button>
            </div>
          )}

          <div className="gift-grid gift-grid--vault">
            {gifts.map((gift) => {
              const tier = getGiftTier(gift);

              return (
                <button
                  key={gift.id}
                  className={selected?.id === gift.id ? `gift-option gift-option--${tier.key} is-active` : `gift-option gift-option--${tier.key}`}
                  type="button"
                  onClick={() => setSelected(gift)}
                >
                  <span className="gift-option__shine" aria-hidden="true" />
                  <span className="gift-option__icon">{gift.icon}</span>
                  <strong>{gift.name}</strong>
                  <small>{formatNumber(gift.credit_price)} credit</small>
                  <em>{tier.label}</em>
                </button>
              );
            })}
          </div>

          <button
            className={`button button--wide button--large gift-send-button gift-send-button--${getGiftTier(selected).key}`}
            type="button"
            onClick={send}
            disabled={busy || !selected || !receiver}
          >
            <Send size={18} /> {busy ? 'Đang gửi...' : `Gửi ${selected?.name || 'quà'}`}
          </button>
        </section>

        <section className="gift-history botanical-card">
          <h2><Trophy size={23} /> Lịch sử quà tặng</h2>

          <div className="gift-history-tabs-v78" role="tablist" aria-label="Lọc lịch sử quà">
            <button
              type="button"
              className={historyFilter === 'all' ? 'is-active' : ''}
              onClick={() => setHistoryFilter('all')}
            >
              Tất cả <span>{formatNumber(transactions.length)}</span>
            </button>

            <button
              type="button"
              className={historyFilter === 'received' ? 'is-active' : ''}
              onClick={() => setHistoryFilter('received')}
            >
              Quà đã nhận <span>{formatNumber(summary.receivedCount)}</span>
            </button>

            <button
              type="button"
              className={historyFilter === 'sent' ? 'is-active' : ''}
              onClick={() => setHistoryFilter('sent')}
            >
              Quà đã gửi <span>{formatNumber(summary.sentCount)}</span>
            </button>
          </div>

          {filteredTransactions.length ? (
            <div className="gift-log-list">
              {filteredTransactions.map((item) => {
                const sent = item.sender_id === currentUser.id;
                const person = sent ? item.receiver : item.sender;
                const tier = getGiftTier(item.gifts || item.cost_credit);

                return (
                  <article key={item.id} className={`gift-log-item gift-log-item--${tier.key}`}>
                    <span className="gift-log-icon">{item.gifts?.icon || '🎁'}</span>
                    <div>
                      <strong>
                        {sent
                          ? `Bạn đã gửi ${item.gifts?.name}`
                          : `Bạn nhận được ${item.gifts?.name}`}
                      </strong>
                      <p>{sent ? `Tới ${getProfileName(person)}` : `Từ ${getProfileName(person)}`}</p>
                      <small>{formatDateTime(item.created_at)}</small>
                    </div>
                    <b className={sent ? 'negative' : 'positive'}>
                      {sent ? '-' : '+'}
                      {formatNumber(sent ? item.cost_credit : item.receiver_credit)} credit
                    </b>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState title="Chưa có lịch sử quà" />
          )}
        </section>
      </div>

      {effectGift && (
        <GiftBurst
          gift={effectGift.gift}
          senderName={getProfileName(currentUser)}
          receiverName={effectGift.receiverName}
          onDone={() => setEffectGift(null)}
        />
      )}
    </div>
  );
}
