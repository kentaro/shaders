"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import useBasePath from '@/lib/useBasePath';

interface Props {
    slug: string;
    title: string;
}

export default function ShaderCard({ slug, title }: Props) {
    const basePath = useBasePath();

    return (
        <motion.div
            whileHover={{ rotateX: -5, rotateY: 8, scale: 1.06 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="relative rounded-xl shadow-neon group w-full"
        >
            <Image
                src={`${basePath}/thumbnails/${slug}.png`}
                alt={title}
                width={800}
                height={450}
                className="rounded-xl w-full h-auto"
                style={{ aspectRatio: '16/9' }}
            />
            <span className="absolute inset-0 rounded-xl bg-neonPink/20 opacity-0 group-hover:opacity-60 animate-glitch pointer-events-none" />
        </motion.div>
    );
} 