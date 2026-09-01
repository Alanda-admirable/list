'use client';

import React from 'react';

export default function ExecutiveCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 animate-pulse flex flex-col justify-between space-y-4">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="h-4 w-28 bg-slate-200 rounded-full" />
          <div className="h-4 w-20 bg-slate-200 rounded-full" />
        </div>

        {/* Profile Header */}
        <div className="flex items-start space-x-3.5 mb-3.5">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-slate-200 flex-shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-3/4 bg-slate-200 rounded" />
            <div className="h-3 w-1/2 bg-slate-100 rounded" />
          </div>
        </div>

        {/* Org Banner */}
        <div className="h-12 bg-slate-100 rounded-xl mb-3" />
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="h-3 w-20 bg-slate-200 rounded" />
        <div className="h-3 w-16 bg-slate-200 rounded" />
      </div>
    </div>
  );
}
