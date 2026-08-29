export const FACES = {
  "Maya Chen": "/faces/maya-chen.jpg",
  "Noah Williams": "/faces/noah-williams.jpg",
  "Iris Okafor": "/faces/iris-okafor.jpg",
  "Jordan Lee": "/faces/jordan-lee.jpg",
  "Alex Rivera": "/faces/alex-rivera.jpg",
} as const;

export type FaceName = keyof typeof FACES;

export function faceSrc(name: FaceName): string {
  return FACES[name];
}
