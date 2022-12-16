interface TemplatePreviewProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export default function TemplatePreview({ left, right }: TemplatePreviewProps) {
  return (
    <div className="PageHeader">
      <div className="PageHeader__left">{left}</div>
      <div className="PageHeader__right">{right}</div>
    </div>
  );
}
