import React from "react";
import { IonIcon } from "@ionic/react";

interface SectionTitleProps {
  icon: string;
  title: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ icon, title }) => {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-black text-[#010080]">
      <IonIcon icon={icon} className="text-lg text-[#0b5ed7] shrink-0" />
      <span>{title}</span>
    </div>
  );
};

