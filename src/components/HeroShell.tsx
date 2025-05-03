"use client";
import dynamic from "next/dynamic";
import type { FC } from "react";

const HeroDynamic = dynamic(() => import("@/components/HeroShaderCarousel"), {
    ssr: false,
});

interface Props {
    slugs: string[];
}

const HeroShell: FC<Props> = (props) => {
    return <HeroDynamic {...props} />;
};
export default HeroShell; 