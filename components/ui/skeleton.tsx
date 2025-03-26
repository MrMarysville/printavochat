"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Skeleton component - provides a visual placeholder while content is loading
 * Supports various preset shapes or custom sizing through className
 */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Controls whether the skeleton shows the loading animation
   * @default true
   */
  isLoading?: boolean;

  /**
   * Preset shapes for common UI elements
   */
  variant?: "text" | "circular" | "rectangular" | "card" | "avatar" | "button";

  /**
   * Number of skeleton items to render (for repeating skeletons)
   * @default 1
   */
  count?: number;

  /**
   * Gap between multiple skeleton items when count > 1
   * @default "0.5rem"
   */
  gap?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  isLoading = true,
  variant = "rectangular",
  count = 1,
  gap = "0.5rem",
  children,
  ...props
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  const getVariantClasses = () => {
    switch (variant) {
      case "text":
        return "h-4 w-full rounded";
      case "circular":
        return "rounded-full h-10 w-10";
      case "avatar":
        return "rounded-full h-12 w-12";
      case "button":
        return "h-10 rounded-md w-24";
      case "card":
        return "h-[200px] w-full rounded-lg";
      case "rectangular":
      default:
        return "h-12 w-full rounded";
    }
  };

  const skeletonClasses = cn(
    "animate-pulse bg-gray-200 dark:bg-gray-700",
    getVariantClasses(),
    className
  );

  if (count === 1) {
    return <div className={skeletonClasses} {...props} />;
  }

  return (
    <div 
      className={cn("flex flex-col", `gap-[${gap}]`)} 
      style={{ gap }}
      {...props}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClasses} />
      ))}
    </div>
  );
};

export { Skeleton };

/**
 * Specialized OrderSkeleton component for order cards
 */
export const OrderSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  const renderOrderSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Skeleton variant="avatar" />
          <div className="ml-3">
            <Skeleton variant="text" className="w-32 mb-2" />
            <Skeleton variant="text" className="w-24 h-3" />
          </div>
        </div>
        <Skeleton variant="button" />
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <Skeleton variant="text" className="mb-2" />
        <Skeleton variant="text" className="w-3/4 mb-2" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
    </div>
  );

  if (count === 1) {
    return renderOrderSkeleton();
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          {renderOrderSkeleton()}
        </React.Fragment>
      ))}
    </div>
  );
};

/**
 * Specialized ChartSkeleton component for dashboard charts
 */
export const ChartSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
    <Skeleton variant="text" className="w-1/3 mb-6" />
    <div className="h-[200px] w-full flex items-end space-x-2">
      {Array.from({ length: 12 }).map((_, index) => (
        <Skeleton 
          key={index} 
          className={`w-full rounded-t-md rounded-b-none h-[${Math.floor(Math.random() * 100) + 20}px]`}
          style={{ height: `${Math.floor(Math.random() * 100) + 20}px` }}
        />
      ))}
    </div>
  </div>
);

/**
 * Specialized DashboardSkeleton component for entire dashboard
 */
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} variant="card" />
      ))}
    </div>
    <ChartSkeleton />
    <div className="mt-6">
      <Skeleton variant="text" className="w-1/4 mb-4" />
      <OrderSkeleton count={3} />
    </div>
  </div>
);
