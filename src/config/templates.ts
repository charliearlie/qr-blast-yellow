import { FaWhatsapp, FaInstagram, FaTelegram, FaSnapchat, FaLink } from 'react-icons/fa';
import { IconType } from 'react-icons';

export interface QRTemplate {
  id: string;
  name: string;
  icon: IconType;
  placeholder: string;
  urlPrefix: string;
  logoUrl?: string;
  isDefault?: boolean;
}

export const templates: QRTemplate[] = [
  {
    id: 'website',
    name: 'Website',
    icon: FaLink,
    placeholder: 'Enter any website URL (e.g., example.com)',
    urlPrefix: 'https://',
    logoUrl: '/img/qr.png',
    isDefault: true,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: FaWhatsapp,
    placeholder: 'Phone number with country code (e.g., 15551234567)',
    urlPrefix: 'https://wa.me/',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: FaInstagram,
    placeholder: 'Your Instagram username',
    urlPrefix: 'https://www.instagram.com/',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: FaTelegram,
    placeholder: 'Your Telegram username',
    urlPrefix: 'https://t.me/',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    icon: FaSnapchat,
    placeholder: 'Your Snapchat username',
    urlPrefix: 'https://www.snapchat.com/add/',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c4/Snapchat_logo.svg',
  },
];