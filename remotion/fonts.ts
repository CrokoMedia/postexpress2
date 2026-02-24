import { loadFont } from '@remotion/fonts'
import { staticFile } from 'remotion'

export const FONT_FAMILY = 'Sofia Pro'

export const loadSofiaProFonts = () => {
  loadFont({
    family: FONT_FAMILY,
    url: staticFile('fonts/sofia-pro/SofiaPro-Light.otf'),
    weight: '300',
  })
  loadFont({
    family: FONT_FAMILY,
    url: staticFile('fonts/sofia-pro/SofiaPro-Regular.otf'),
    weight: '400',
  })
  loadFont({
    family: FONT_FAMILY,
    url: staticFile('fonts/sofia-pro/SofiaPro-Medium.otf'),
    weight: '500',
  })
  loadFont({
    family: FONT_FAMILY,
    url: staticFile('fonts/sofia-pro/SofiaPro-SemiBold.otf'),
    weight: '600',
  })
  loadFont({
    family: FONT_FAMILY,
    url: staticFile('fonts/sofia-pro/SofiaPro-Bold.otf'),
    weight: '700',
  })
}
