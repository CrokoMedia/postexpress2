/**
 * Carousel Slide Component - Exemplo de Referência
 *
 * Este componente seria gerado automaticamente pelo Claude Code
 * usando Figma MCP (get_design_context) a partir do template Figma.
 *
 * Mantido aqui como referência de estrutura ideal.
 */

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export type SlideType = 'cover' | 'content' | 'stats' | 'cta';
export type SlideVariant = 'default' | 'dark' | 'bold';

export interface CarouselSlideProps {
  type: SlideType;
  variant?: SlideVariant;
  children: React.ReactNode;
  slideNumber?: string;
  username?: string;
  className?: string;
}

// ============================================================================
// Base Component
// ============================================================================

export const CarouselSlide: React.FC<CarouselSlideProps> = ({
  type,
  variant = 'default',
  children,
  slideNumber = '1/10',
  username = '@postexpress',
  className,
}) => {
  // Background baseado na variante
  const backgroundClasses = {
    default: 'bg-neutral-50',
    dark: 'bg-gradient-to-b from-neutral-900 to-neutral-800 text-white',
    bold: 'bg-gradient-to-br from-primary-500 to-pink-500 text-white',
  };

  return (
    <div
      className={cn(
        // Base classes (sempre aplicadas)
        'relative w-[1080px] h-[1080px] flex flex-col',
        'p-20', // Safe area (80px)

        // Variant classes
        backgroundClasses[variant],

        // Custom classes
        className
      )}
      data-slide-type={type}
      data-slide-variant={variant}
    >
      {/* Header */}
      <Header variant={variant} />

      {/* Content Area (flex-1 para ocupar espaço disponível) */}
      <div className="flex-1 flex flex-col justify-center">
        {children}
      </div>

      {/* Footer */}
      <Footer username={username} slideNumber={slideNumber} variant={variant} />
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

interface HeaderProps {
  variant: SlideVariant;
}

const Header: React.FC<HeaderProps> = ({ variant }) => {
  const textColor = variant === 'default' ? 'text-neutral-900' : 'text-white';

  return (
    <div className="flex items-center gap-3 mb-10">
      {/* Logo Badge */}
      <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
        <span className="text-white text-lg font-bold">P</span>
      </div>

      {/* Brand Text */}
      <span className={cn('text-sm font-semibold', textColor)}>
        Croko Labs
      </span>
    </div>
  );
};

interface FooterProps {
  username: string;
  slideNumber: string;
  variant: SlideVariant;
}

const Footer: React.FC<FooterProps> = ({ username, slideNumber, variant }) => {
  const textColor = variant === 'default' ? 'text-neutral-500' : 'text-white/60';

  return (
    <div className={cn('flex justify-between items-center text-xs', textColor)}>
      <span>{username}</span>
      <span>{slideNumber}</span>
    </div>
  );
};

// ============================================================================
// Specialized Slide Types (composable)
// ============================================================================

/**
 * SlideCover - Slide de abertura
 */
export interface SlideCoverProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  variant?: SlideVariant;
  slideNumber?: string;
}

export const SlideCover: React.FC<SlideCoverProps> = ({
  kicker,
  title,
  subtitle,
  variant = 'default',
  slideNumber = '1/10',
}) => {
  return (
    <CarouselSlide type="cover" variant={variant} slideNumber={slideNumber}>
      <div className="relative text-center space-y-6">
        {/* Gradient Orb (visual accent) */}
        {variant === 'default' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-gradient-to-br from-primary-500 to-pink-500 rounded-full blur-[100px] opacity-30 pointer-events-none" />
        )}

        {/* Kicker */}
        {kicker && (
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
            {kicker}
          </p>
        )}

        {/* Main Title */}
        <h1 className="text-4xl font-bold leading-tight max-w-[800px] mx-auto relative z-10">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-lg text-neutral-600 max-w-[700px] mx-auto relative z-10">
            {subtitle}
          </p>
        )}
      </div>
    </CarouselSlide>
  );
};

/**
 * SlideContent - Slide de conteúdo (lista)
 */
export interface SlideContentItem {
  number?: number;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface SlideContentProps {
  sectionTitle: string;
  items: SlideContentItem[];
  variant?: SlideVariant;
  slideNumber?: string;
}

export const SlideContent: React.FC<SlideContentProps> = ({
  sectionTitle,
  items,
  variant = 'default',
  slideNumber,
}) => {
  return (
    <CarouselSlide type="content" variant={variant} slideNumber={slideNumber}>
      <div className="space-y-8">
        {/* Section Title */}
        <h2 className="text-2xl font-bold">{sectionTitle}</h2>

        {/* Content List */}
        <div className="space-y-6">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex gap-4 p-5 rounded-xl bg-white/80 backdrop-blur-sm shadow-md"
            >
              {/* Number Badge or Icon */}
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-lg font-semibold">
                {item.icon || (item.number ?? index + 1)}
              </div>

              {/* Text Content */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                {item.description && (
                  <p className="text-base text-neutral-600">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </CarouselSlide>
  );
};

/**
 * SlideStats - Slide de métricas
 */
export interface StatItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  color?: 'success' | 'warning' | 'primary';
}

export interface SlideStatsProps {
  sectionTitle?: string;
  stats: StatItem[];
  subtext?: string;
  variant?: SlideVariant;
  slideNumber?: string;
}

export const SlideStats: React.FC<SlideStatsProps> = ({
  sectionTitle,
  stats,
  subtext,
  variant = 'default',
  slideNumber,
}) => {
  const colorMap = {
    success: 'text-success',
    warning: 'text-warning',
    primary: 'text-primary-600',
  };

  return (
    <CarouselSlide type="stats" variant={variant} slideNumber={slideNumber}>
      <div className="space-y-12 text-center">
        {/* Section Title */}
        {sectionTitle && (
          <h2 className="text-xl font-semibold">{sectionTitle}</h2>
        )}

        {/* Stats Grid */}
        <div className="flex justify-center gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-white shadow-lg min-w-[200px]"
            >
              {/* Value */}
              <div className={cn('text-5xl font-extrabold', colorMap[stat.color || 'primary'])}>
                {stat.value}
              </div>

              {/* Label */}
              <div className="text-sm text-neutral-600">{stat.label}</div>

              {/* Icon */}
              {stat.icon && (
                <div className="text-success w-6 h-6">{stat.icon}</div>
              )}
            </div>
          ))}
        </div>

        {/* Subtext */}
        {subtext && (
          <p className="text-sm text-neutral-600">{subtext}</p>
        )}
      </div>
    </CarouselSlide>
  );
};

/**
 * SlideCTA - Slide de chamada para ação
 */
export interface SlideCTAProps {
  headline: string;
  buttonText?: string;
  subtext?: string;
  socialProof?: {
    avatars?: string[];
    text?: string;
  };
  variant?: SlideVariant;
  slideNumber?: string;
}

export const SlideCTA: React.FC<SlideCTAProps> = ({
  headline,
  buttonText = 'Começar Agora',
  subtext,
  socialProof,
  variant = 'default',
  slideNumber,
}) => {
  return (
    <CarouselSlide type="cta" variant={variant} slideNumber={slideNumber}>
      <div className="space-y-8 text-center">
        {/* Headline */}
        <h2 className="text-3xl font-bold max-w-[700px] mx-auto">
          {headline}
        </h2>

        {/* Button */}
        {buttonText && (
          <button className="px-10 py-5 bg-primary-500 text-white text-lg font-semibold rounded-xl shadow-lg hover:bg-primary-600 transition-colors inline-flex items-center gap-2">
            {buttonText}
            <span>→</span>
          </button>
        )}

        {/* Subtext */}
        {subtext && (
          <p className="text-sm text-neutral-600">{subtext}</p>
        )}

        {/* Social Proof */}
        {socialProof && (
          <div className="flex items-center justify-center gap-4 mt-8">
            {/* Avatar Stack */}
            {socialProof.avatars && socialProof.avatars.length > 0 && (
              <div className="flex -space-x-2">
                {socialProof.avatars.map((avatar, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full bg-neutral-300 border-2 border-white overflow-hidden"
                  >
                    <img src={avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Text */}
            {socialProof.text && (
              <p className="text-sm text-neutral-600">{socialProof.text}</p>
            )}
          </div>
        )}
      </div>
    </CarouselSlide>
  );
};

// ============================================================================
// Usage Examples (for Storybook or docs)
// ============================================================================

export const Examples = {
  Cover: (
    <SlideCover
      kicker="AUDITORIA PROFISSIONAL"
      title="Como Transformar Seu Instagram em Máquina de Vendas"
      subtitle="Análise científica baseada em 5 frameworks"
      slideNumber="1/10"
    />
  ),

  Content: (
    <SlideContent
      sectionTitle="3 Gatilhos que Fazem Seu Público Parar de Scrollar"
      items={[
        {
          number: 1,
          title: 'Padrão Interrompido',
          description: 'Comece com algo inesperado que quebre o padrão do feed',
        },
        {
          number: 2,
          title: 'Curiosity Gap',
          description: 'Prometa uma revelação que só vem nos próximos slides',
        },
        {
          number: 3,
          title: 'Social Proof Visual',
          description: 'Mostre resultado tangível logo no primeiro slide',
        },
      ]}
      slideNumber="3/10"
    />
  ),

  Stats: (
    <SlideStats
      sectionTitle="Resultados Reais em 30 Dias"
      stats={[
        { value: '347%', label: 'Aumento em Alcance', color: 'success' },
        { value: '2.8k', label: 'Novos Seguidores', color: 'primary' },
        { value: '92%', label: 'Taxa de Aprovação', color: 'success' },
      ]}
      subtext="Sem anúncios • Sem compra de seguidores"
      slideNumber="5/10"
    />
  ),

  CTA: (
    <SlideCTA
      headline="Pronto para Transformar Seu Conteúdo?"
      buttonText="Começar Agora"
      subtext="Teste grátis por 7 dias • Sem cartão de crédito"
      socialProof={{
        text: 'Mais de 500 creators já transformaram seus resultados',
      }}
      slideNumber="10/10"
    />
  ),
};

// ============================================================================
// Export all
// ============================================================================

export default CarouselSlide;
