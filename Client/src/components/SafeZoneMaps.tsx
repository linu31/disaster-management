import RealMap from "./RealMap";
import { type DisasterType } from "@/pages/Dashboard";

interface SafeZoneMapsProps {
  disasterType: DisasterType;
  onClose: () => void;
}

const SafeZoneMaps = ({ disasterType, onClose }: SafeZoneMapsProps) => {
  return <RealMap disasterType={disasterType} onClose={onClose} />;
};

export default SafeZoneMaps;