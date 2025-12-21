'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  href?: string;
  label?: string;
  variant?: 'default' | 'ghost' | 'outline' | 'link';
  className?: string;
  onClick?: () => void;
  showIcon?: boolean;
}

export default function BackButton({
  href,
  label = 'Back',
  variant = 'ghost',
  className,
  onClick,
  showIcon = true,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      className={cn(
        'group transition-all duration-200',
        variant === 'ghost' && 'hover:bg-primary-50',
        className
      )}
    >
      {showIcon && (
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
      )}
      {label}
    </Button>
  );
}
