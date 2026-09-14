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
  const hasImage = !!category.image_url;

  return (
    <Card 
      elevation={0}
      className={className}
      sx={{ 
        height: "100%", 
        minHeight: "170px",
        borderRadius: "16px", 
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s ease-in-out",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          borderColor: theme.palette.primary.light,
          boxShadow: theme.shadows[2],
          transform: "translateY(-3px)",
          "& .category-img": {
            transform: "scale(1.04)"
          }
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
          alignItems: "stretch", 
          justifyContent: "flex-start",
        }}
      >
        {/* Top Image or Placeholder */}
        <Box 
          sx={{ 
            width: "100%", 
            height: "90px", 
            position: "relative",
            backgroundColor: hasImage ? "transparent" : theme.palette.primary.main + "10",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          {hasImage ? (
            <img 
              src={category.image_url!} 
              alt={category.name}
              className="category-img"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.3s ease",
              }}
            />
          ) : (
            <Icon size={32} style={{ color: theme.palette.primary.main }} />
          )}
        </Box>

        {/* Bottom Content */}
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 700, 
                lineHeight: 1.2,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                color: "text.primary"
              }}
            >
              {category.name}
            </Typography>
            <ArrowRight size={14} style={{ color: theme.palette.primary.main, flexShrink: 0, marginTop: "2px" }} />
          </Box>

          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, mt: 1 }}>
            {category.event_count !== undefined ? `${category.event_count} ${category.event_count === 1 ? "event" : "events"}` : "Explore"}
          </Typography>
        </Box>
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
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 sm:gap-4 hide-scrollbar">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="h-full shrink-0 w-[120px] sm:w-auto snap-start"
          >
            <CategoryCard category={cat} />
          </motion.div>
        ))}
      </div>
    </Box>
  );
}

