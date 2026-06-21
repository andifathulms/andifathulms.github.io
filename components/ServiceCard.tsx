interface ServiceCardProps {
  title: string;
  description: string;
}

export default function ServiceCard({ title, description }: ServiceCardProps) {
  return (
    <div className="border-t border-gold/20 pt-5">
      <h3 className="font-heading text-base font-medium text-cream mb-2">{title}</h3>
      <p className="text-sm text-cream/60 leading-relaxed">{description}</p>
    </div>
  );
}
