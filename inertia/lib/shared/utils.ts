import { createCn } from 'cn/config'

export const cn = createCn({
  extend: {
    theme: {
      text: ['2xs', 'caption', 'meta', 'note', 'md', 'lead', 'title', 'display', 'h1', 'h2'],
      radius: ['inner', 'cta', 'pill'],
      shadow: ['1', '2', 'pin', 'sheet'],
      spacing: [
        'cta',
        'btn',
        'btn-desktop',
        'btn-compact',
        'icon-btn',
        'input',
        'otp',
        'tab-bar',
        'badge',
      ],
    },
  },
})
