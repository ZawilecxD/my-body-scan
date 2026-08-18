export type Region = 'head' | 'torso' | 'arms' | 'legs';
export type Side = 'front' | 'back';

export type Landmark = {
  id: string;
  region: Region;
  side: Side;
  name: string;
};

export const REGION_ORDER: readonly Region[] = ['head', 'torso', 'arms', 'legs'];

export const LANDMARKS: readonly Landmark[] = [
  { id: 'head-front-skull', region: 'head', side: 'front', name: 'Skull' },
  { id: 'head-front-jaw', region: 'head', side: 'front', name: 'Jaw' },
  { id: 'head-front-neck', region: 'head', side: 'front', name: 'Neck' },
  { id: 'head-back-skull', region: 'head', side: 'back', name: 'Skull' },
  { id: 'head-back-neck', region: 'head', side: 'back', name: 'Neck' },

  { id: 'torso-front-collarbone', region: 'torso', side: 'front', name: 'Collarbone' },
  { id: 'torso-front-chest', region: 'torso', side: 'front', name: 'Chest' },
  { id: 'torso-front-ribs', region: 'torso', side: 'front', name: 'Ribs' },
  { id: 'torso-front-abdomen', region: 'torso', side: 'front', name: 'Abdomen' },
  { id: 'torso-back-upper-back', region: 'torso', side: 'back', name: 'Upper back' },
  { id: 'torso-back-lower-back', region: 'torso', side: 'back', name: 'Lower back' },

  { id: 'arms-front-shoulder', region: 'arms', side: 'front', name: 'Shoulder' },
  { id: 'arms-front-upper-arm', region: 'arms', side: 'front', name: 'Upper arm' },
  { id: 'arms-front-elbow', region: 'arms', side: 'front', name: 'Elbow' },
  { id: 'arms-front-forearm', region: 'arms', side: 'front', name: 'Forearm' },
  { id: 'arms-front-wrist', region: 'arms', side: 'front', name: 'Wrist' },
  { id: 'arms-front-hand', region: 'arms', side: 'front', name: 'Hand' },
  { id: 'arms-back-shoulder', region: 'arms', side: 'back', name: 'Shoulder' },
  { id: 'arms-back-upper-arm', region: 'arms', side: 'back', name: 'Upper arm' },
  { id: 'arms-back-elbow', region: 'arms', side: 'back', name: 'Elbow' },
  { id: 'arms-back-forearm', region: 'arms', side: 'back', name: 'Forearm' },
  { id: 'arms-back-wrist', region: 'arms', side: 'back', name: 'Wrist' },
  { id: 'arms-back-hand', region: 'arms', side: 'back', name: 'Hand' },

  { id: 'legs-front-hip', region: 'legs', side: 'front', name: 'Hip' },
  { id: 'legs-front-thigh', region: 'legs', side: 'front', name: 'Thigh' },
  { id: 'legs-front-knee', region: 'legs', side: 'front', name: 'Knee' },
  { id: 'legs-front-shin', region: 'legs', side: 'front', name: 'Shin' },
  { id: 'legs-front-ankle', region: 'legs', side: 'front', name: 'Ankle' },
  { id: 'legs-front-foot', region: 'legs', side: 'front', name: 'Foot' },
  { id: 'legs-back-glute', region: 'legs', side: 'back', name: 'Glute' },
  { id: 'legs-back-hamstring', region: 'legs', side: 'back', name: 'Hamstring' },
  { id: 'legs-back-knee', region: 'legs', side: 'back', name: 'Knee' },
  { id: 'legs-back-calf', region: 'legs', side: 'back', name: 'Calf' },
  { id: 'legs-back-ankle', region: 'legs', side: 'back', name: 'Ankle' },
  { id: 'legs-back-foot', region: 'legs', side: 'back', name: 'Foot' },
];

export function getLandmarkById(id: string): Landmark | undefined {
  return LANDMARKS.find((landmark) => landmark.id === id);
}

export function groupLandmarksByRegion(
  landmarks: readonly Landmark[],
): { region: Region; landmarks: Landmark[] }[] {
  return REGION_ORDER.map((region) => ({
    region,
    landmarks: landmarks.filter((landmark) => landmark.region === region),
  }));
}
