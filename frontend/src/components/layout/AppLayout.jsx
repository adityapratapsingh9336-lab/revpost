import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { mockBrands, mockWorkspaces } from '../../data/mockData';
import { api } from '../../services/api';

export const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [workspaces, setWorkspaces] = useState(mockWorkspaces);
  const [activeWorkspace, setActiveWorkspace] = useState(mockWorkspaces[0]);
  const [brands, setBrands] = useState(mockBrands);
  const [activeBrand, setActiveBrand] = useState(mockBrands[0]);

  const refreshData = async () => {
    const [wsList, brandList] = await Promise.all([
      api.getWorkspaces(),
      api.getBrands(),
    ]);
    if (wsList && wsList.length > 0) {
      setWorkspaces(wsList);
      setActiveWorkspace(prev => wsList.find(w => w.id === prev?.id) || wsList[0]);
    }
    if (brandList && brandList.length > 0) {
      setBrands(brandList);
      setActiveBrand(prev => brandList.find(b => b.id === prev?.id) || brandList[0]);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Navigation Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activeBrand={activeBrand}
        setActiveBrand={setActiveBrand}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Navbar
          brands={brands}
          activeBrand={activeBrand}
          setActiveBrand={setActiveBrand}
        />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet
            context={{
              activeBrand,
              setActiveBrand,
              brands,
              workspaces,
              activeWorkspace,
              setActiveWorkspace,
              refreshData,
            }}
          />
        </main>
      </div>
    </div>
  );
};
