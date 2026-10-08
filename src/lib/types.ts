export type Lang = 'vi' | 'en';
export type Bi = { v: string; e: string };
export type Cat = 'router' | 'ap' | 'switch' | 'more';

export interface Port {
  r: string; // role: w wan, l lan, s wan/lan, u usb/console, x dsl/pon/cellular
  m: string; // medium: rj sfp sfpp usb con ...
  sp?: string;
  lb?: string;
  n?: number;
  poe?: boolean;
}

export interface Device {
  id: string;
  cat: Cat;
  m: string;
  st: 'cur' | 'old' | 'eos';
  eol?: string;
  fw?: string;
  t: Bi;
  var?: [string, Bi][];
  fp?: Port[];
  s: Record<string, any>;
  src?: Record<string, string>;
  u?: [number, number];
  uses?: string[];
  f?: string[];
  note?: { v: string[]; e: string[] };
  next?: string;
  hw?: Record<string, any>;
  [k: string]: any;
}

export interface Use {
  id: string;
  v: string;
  e: string;
  k: string;
}

export interface ImageEntry {
  src: string;
  thumb: string;
  full: string;
  fw: number;
  fh: number;
  w: number;
  h: number;
  from: string;
}
