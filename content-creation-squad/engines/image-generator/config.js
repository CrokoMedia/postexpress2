/**
 * Configurações do Image Generator Engine
 */

export const FORMATS = {
  POST: {
    name: 'post',
    width: 1080,
    height: 1350,
    description: 'Instagram/LinkedIn Post (1080x1350)'
  },
  STORIES: {
    name: 'stories',
    width: 1080,
    height: 1920,
    description: 'Instagram/LinkedIn Stories (1080x1920)'
  }
};

export const STYLES = {
  FIGMA: {
    name: 'figma',
    description: 'Estilo Figma - Fundo branco, texto preto, minimalista',
    background: '#FFFFFF',
    textColor: '#000000',
    accentColor: '#000000',
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: {
      title: 72,
      subtitle: 38,
      text: 39,
      cta: 48
    },
    letterSpacing: '-1.17px',
    lineHeight: '118%',
    borderRadius: '20px',
    padding: {
      horizontal: 65,
      vertical: 80,
      content: 40
    }
  },
  GRADIENT: {
    name: 'gradient',
    description: 'Estilo Gradiente - Fundos coloridos, texto branco',
    textColor: '#FFFFFF',
    fontFamily: 'Inter',
    fontWeight: {
      title: '900',
      subtitle: '500',
      text: '400',
      cta: '700'
    },
    fontSize: {
      title: 72,
      subtitle: 38,
      text: 36,
      cta: 48
    },
    lineHeight: '140%',
    borderRadius: '12px',
    padding: {
      horizontal: 90,
      vertical: 100,
      content: 60
    },
    gradients: {
      'gradient-escuro': 'linear-gradient(135deg, #1A1A1A 0%, #2C3E50 100%)',
      'gradient-transicao': 'linear-gradient(135deg, #34495E 0%, #27AE60 70%)',
      'gradient-prosperidade': 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)'
    },
    colors: {
      azulEscuro: '#2C3E50',
      azulMedio: '#34495E',
      verdeProsp: '#27AE60',
      verdeClaro: '#2ECC71',
      vermelhoInv: '#E74C3C',
      dourado: '#FFD23F',
      azulDest: '#3498DB',
      preto: '#1A1A1A',
      branco: '#FFFFFF'
    }
  },
  BRANDS_DECODED_WHITE: {
    name: 'brands-decoded-white',
    description: 'BrandsDecoded® Template - Fundo branco, 3 parágrafos, minimalista',
    template: 'brands-decoded-white.html',
    background: '#FFFFFF',
    textColor: '#000000',
    fontFamily: 'Inter',
    fontWeight: {
      paragraph: '400',
      authorName: '600',
      authorHandle: '400'
    },
    fontSize: {
      paragraph: 39,
      authorName: 43,
      authorHandle: 39
    },
    lineHeight: '150%',
    padding: {
      horizontal: 80,
      vertical: 100
    },
    layout: {
      type: 'three-paragraphs',
      paragraphGap: 40,
      footerBorderColor: '#f0f0f0'
    }
  },
  BRANDS_DECODED_BLACK: {
    name: 'brands-decoded-black',
    description: 'BrandsDecoded® Template - Fundo preto, 3 parágrafos, CTA final',
    template: 'brands-decoded-black.html',
    background: '#000000',
    textColor: '#FFFFFF',
    fontFamily: 'Inter',
    fontWeight: {
      paragraph: '400',
      authorName: '600',
      authorHandle: '400'
    },
    fontSize: {
      paragraph: 39,
      authorName: 43,
      authorHandle: 39
    },
    lineHeight: '150%',
    padding: {
      horizontal: 80,
      vertical: 100
    },
    layout: {
      type: 'three-paragraphs',
      paragraphGap: 40,
      footerBorderColor: '#333333',
      authorHandleColor: '#999999'
    }
  }
};

export const OUTPUT = {
  baseDir: 'output',
  imageFormat: 'png',
  quality: 100,
  scale: 2, // 2x para qualidade Instagram
  createZip: true
};

export const SCREENSHOT_OPTIONS = {
  type: 'png',
  fullPage: true,
  animations: 'disabled',
  scale: 'device', // Use device scale for high DPI
};
