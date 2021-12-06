import React, {useEffect, lazy, Suspense} from 'react';
import {Navigate, Routes, Route, useLocation} from 'react-router-dom';

import Footer from 'containers/footer';
import Navbar from 'containers/navbar';
import WalletMenu from 'containers/walletMenu';
import {trackPage} from 'services/analytics';
import '../i18n.config';

import HomePage from 'pages/home';
import * as paths from 'utils/paths';
const TokensPage = lazy(() => import('pages/tokens'));
const FinancePage = lazy(() => import('pages/finance'));
const NotFoundPage = lazy(() => import('pages/notFound'));
const CommunityPage = lazy(() => import('pages/community'));
const TransfersPage = lazy(() => import('pages/transfers'));
const GovernancePage = lazy(() => import('pages/governance'));

function App() {
  const {pathname} = useLocation();

  useEffect(() => {
    trackPage(pathname);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="bg-primary-50">
      <Navbar />
      <div className="min-h-screen">
        <Suspense fallback={null}>
          <Routes>
            <Route path={paths.Dashboard} element={<HomePage />} />
            <Route path={paths.Community} element={<CommunityPage />} />
            <Route path={paths.Finance} element={<FinancePage />} />
            <Route path={paths.Governance} element={<GovernancePage />} />
            <Route path={paths.AllTokens} element={<TokensPage />} />
            <Route path={paths.AllTransfers} element={<TransfersPage />} />
            <Route path={paths.NotFound} element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to={paths.NotFound} />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
      <WalletMenu />
    </div>
  );
}

export default App;
