"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from 'next/router';
import getConfig from 'next/config';

interface Props {
    slug: string;
    title: string;
}

// 設定を取得
const { publicRuntimeConfig } = getConfig() || {};
const basePath = publicRuntimeConfig?.basePath || '';

export default function ShaderCard({ slug, title }: Props) {
    return (
        <motion.div
            whileHover={{ rotateX: -5, rotateY: 8, scale: 1.06 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="relative rounded-xl shadow-neon group"
        >
            <Image
                src={`${basePath}/thumbnails/${slug}.png`}
                alt={title}
                width={320}
                height={180}
                className="rounded-xl"
            />
            <span className="absolute inset-0 rounded-xl bg-neonPink/20 opacity-0 group-hover:opacity-60 animate-glitch pointer-events-none" />
        </motion.div>
    );
} 