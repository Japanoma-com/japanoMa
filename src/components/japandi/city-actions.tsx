'use client';

import { SaveButton } from './save-button';
import { CompareButton } from './compare-button';

type CityActionsProps = {
  citySlug: string;
  cityName: string;
  prefectureSlug: string;
  prefectureName: string;
  isAuthenticated: boolean;
  initialSaved?: boolean;
};

export function CityActions(props: CityActionsProps) {
  return (
    <div className="flex gap-ma-6 mb-ma-8">
      <SaveButton
        contentType="city"
        contentId={props.citySlug}
        title={props.cityName}
        href={`/areas/${props.prefectureSlug}/${props.citySlug}`}
        isAuthenticated={props.isAuthenticated}
        initialSaved={props.initialSaved}
      />
      <CompareButton
        citySlug={props.citySlug}
        cityName={props.cityName}
        prefectureSlug={props.prefectureSlug}
        prefectureName={props.prefectureName}
      />
    </div>
  );
}
