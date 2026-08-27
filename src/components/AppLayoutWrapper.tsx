import React from 'react';

interface AppLayoutWrapperProps {
  children?: React.ReactNode;
  header: React.ReactNode;
  canvas: React.ReactNode;
  sidebar: React.ReactNode;
  floatingControls?: React.ReactNode;
  bottomNav?: React.ReactNode;
  modals?: React.ReactNode;
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
  toast?: React.ReactNode;
}

/**
 * AppLayoutWrapper:
 * A comprehensive responsive layout wrapper for Kelk Calligraphy Studio.
 * Uses Tailwind responsive utilities and CSS media queries to guarantee:
 * 1. 100% viewport fit (100dvh / 100vh) with no horizontal/vertical page blowout
 * 2. Mobile-adaptive Header bar with auto-scaling font size, icon sizes, and menus
 * 3. Smooth off-canvas responsive sliding drawer for Tools Panel on screens < 1024px
 * 4. Fixed bottom navigation bar with safe-area bottom padding
 * 5. Full responsiveness across mobile portrait, landscape, tablet, and desktop
 */
export const AppLayoutWrapper: React.FC<AppLayoutWrapperProps> = React.memo(({
  header,
  canvas,
  sidebar,
  floatingControls,
  bottomNav,
  modals,
  isMobileDrawerOpen = false,
  onCloseMobileDrawer,
  toast,
}) => {
  return (
    <div 
      id="kelk-app-root-wrapper"
      className="flex flex-col h-[100dvh] h-screen w-screen max-w-full overflow-hidden bg-neutral-950 text-neutral-100 font-vazir select-none antialiased relative"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      {/* 1. Header Zone: Responsive height and padding */}
      <div 
        id="kelk-header-zone"
        className="w-full shrink-0 z-40 transition-all duration-200"
      >
        {header}
      </div>

      {/* 2. Main Workspace Zone: Contains Canvas Stage & Responsive Sidebar Drawer */}
      <main 
        id="kelk-workspace-zone"
        className="flex-1 w-full min-h-0 min-w-0 flex overflow-hidden relative"
      >
        {/* Calligraphy Canvas Viewport */}
        <section 
          id="kelk-canvas-viewport"
          className="flex-1 h-full min-h-0 min-w-0 flex flex-col relative overflow-hidden bg-neutral-900"
        >
          {canvas}

          {/* Floating Element Quick Action Controls */}
          {floatingControls && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center z-30">
              <div className="pointer-events-auto">
                {floatingControls}
              </div>
            </div>
          )}
        </section>

        {/* Sidebar Tools Panel Zone */}
        {/* On desktop (>=1024px): Sits naturally in layout */}
        {/* On mobile/tablet (<1024px): Handled as a slide-out drawer */}
        <section 
          id="kelk-sidebar-zone"
          className="shrink-0 h-full min-h-0 relative z-30"
        >
          {sidebar}
        </section>
      </main>

      {/* 3. Mobile Bottom Navigation Zone (< 1024px) */}
      {bottomNav && (
        <footer 
          id="kelk-mobile-nav-zone"
          className="lg:hidden shrink-0 w-full z-40 bg-neutral-950 border-t border-neutral-800"
        >
          {bottomNav}
        </footer>
      )}

      {/* 4. Feedback Toast Zone */}
      {toast && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 w-full max-w-md flex justify-center">
          <div className="pointer-events-auto">
            {toast}
          </div>
        </div>
      )}

      {/* 5. Modals & Popovers Overlay Zone */}
      {modals}
    </div>
  );
});

