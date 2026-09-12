"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Cpu, Code2, Wrench, Presentation, Music, Trophy, Award, Users, Star, Briefcase, MoreHorizontal, ArrowRight, type LucideIcon
} from "lucide-react";
import { Category } from "@/types";

// MUI Imports
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";

const iconMap: Record<string, LucideIcon> = {
  cpu: Cpu,
  "code-2": Code2,
  wrench: Wrench,
  presentation: Presentation,
  music: Music,
  trophy: Trophy,
  award: Award,
  users: Users,
  star: Star,
  briefcase: Briefcase,
  "more-horizontal": MoreHorizontal,
};

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const theme = useTheme();
  const Icon = iconMap[category.icon] || MoreHorizontal;

  return (
    <Card 
      elevation={0}
      sx={{ 
        height: "100%", 
        minHeight: "140px",
        borderRadius: "16px", 
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: theme.palette.primary.light,
          boxShadow: theme.shadows[2],
          transform: "translateY(-3px)",
        }
      }}
    >
      <CardActionArea 
        component={Link} 
        href={`/events?category=${category.slug}`}
        sx={{ 
          height: "100%", 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "space-between",
          p: 2
        }}
      >
        {/* Icon */}
        <Box 
          sx={{ 
            width: 44, 
            height: 44, 
            borderRadius: "12px", 
            backgroundColor: theme.palette.primary.main + "15", // 15% opacity
            color: theme.palette.primary.main,
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            mb: 1
          }}
        >
          <Icon size={20} />
        </Box>

        {/* Title */}
        <Box sx={{ height: 36, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", width: "100%" }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 700, 
              lineHeight: 1.2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            }}
          >
            {category.name}
          </Typography>
        </Box>

        {/* Event Count */}
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, mt: 0.5 }}>
          {category.event_count !== undefined ? `${category.event_count} ${category.event_count === 1 ? "event" : "events"}` : "Explore"}
        </Typography>
      </CardActionArea>
    </Card>
  );
}

interface CategoryGridProps {
  categories: Category[];
  title?: string;
}

export function CategoryGrid({ categories, title = "Browse Categories" }: CategoryGridProps) {
  return (
    <Box component="section">
      {title && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box>
            <Typography variant="h3" sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" }, color: "text.primary" }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              Find events across specialized disciplines
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/events?view=categories"
            color="primary"
            endIcon={<ArrowRight size={16} />}
            sx={{ fontWeight: 600, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
          >
            View all
          </Button>
        </Box>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="h-full"
          >
            <CategoryCard category={cat} />
          </motion.div>
        ))}
      </div>
    </Box>
  );
}

