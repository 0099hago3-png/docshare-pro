export default function BotanicalHero({ eyebrow, title, description, children, compact = false }) {
  return (
    <section className={`botanical-hero${compact ? ' botanical-hero--compact' : ''}`}>
      <div className="botanical-hero__content">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {children}
      </div>
    </section>
  );
}
