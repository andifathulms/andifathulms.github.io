import { Link } from '@/i18n/navigation';

interface ServiceCardProps {
  title: string;
  description: string;
  /** Where the claim's evidence lives. Every service links to the work that
      backs it, so nothing on this grid is an assertion you can't check. */
  href: string;
}

export default function ServiceCard({ title, description, href }: ServiceCardProps) {
  return (
    <Link
      href={href}
      className="group block border-t border-line pt-5 hover:border-line-strong transition-colors"
    >
      <h3 className="font-heading text-lead font-medium text-cream mb-2 group-hover:text-gold transition-colors">
        {title}
        <span
          aria-hidden="true"
          className="ml-1.5 inline-block text-gold opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 motion-reduce:transition-none motion-reduce:translate-x-0"
        >
          →
        </span>
      </h3>
      <p className="text-body text-text-muted leading-relaxed">{description}</p>
    </Link>
  );
}
