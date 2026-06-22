export default function SummitBanner({ text }) {
  return (
    <div className={`summit-banner${text ? ' show' : ''}`}>
      {text || ''}
    </div>
  );
}
