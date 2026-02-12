import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  PhotoIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useFuturisticSound } from '../hooks/useFuturisticSound';

const navigation = [
  { name: 'Command Center', href: '/', icon: HomeIcon },
  { name: 'Mission Wizard', href: '/wizard', icon: SparklesIcon },
  { name: 'Sprite Lab', href: '/images', icon: PhotoIcon },
  { name: 'Neural Link', href: '/metadata', icon: DocumentTextIcon },
  { name: 'Launch Pad', href: '/submission', icon: CloudArrowUpIcon },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { playClick, playHover } = useFuturisticSound();

  return (
    <>
      <div className="min-h-screen bg-cyber-black bg-cyber-grid bg-[length:40px_40px]">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-cyber-blue" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-cyber-dark/90 backdrop-blur-xl px-6 pb-4 ring-1 ring-white/10 border-r border-cyber-blue/30">
                    <div className="flex h-16 shrink-0 items-center">
                       <span className="text-2xl font-bold font-orbitron hologram-text tracking-widest">AUTOSUBMIT</span>
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <Link
                                  to={item.href}
                                  onClick={playClick}
                                  className={clsx(
                                    location.pathname === item.href
                                      ? 'bg-cyber-blue/10 text-cyber-blue border-r-2 border-cyber-blue shadow-neon-blue'
                                      : 'text-gray-400 hover:text-cyber-blue hover:bg-cyber-blue/5',
                                    'group flex gap-x-3 p-2 text-sm leading-6 font-semibold font-rajdhani transition-all'
                                  )}
                                >
                                  <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-cyber-dark/80 backdrop-blur-md px-6 pb-4 border-r border-cyber-blue/20 shadow-glass">
            <div className="flex h-16 shrink-0 items-center mt-4">
              <span className="text-3xl font-black font-orbitron hologram-text tracking-widest animate-pulse">AUTOSUBMIT</span>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-4">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={playClick}
                          onMouseEnter={playHover}
                          className={clsx(
                            location.pathname === item.href
                              ? 'bg-cyber-blue/10 text-cyber-blue border-r-4 border-cyber-blue shadow-[inset_0_0_10px_rgba(0,243,255,0.2)]'
                              : 'text-gray-400 hover:text-white hover:bg-cyber-blue/5 hover:border-r-4 hover:border-cyber-blue/50',
                            'group flex gap-x-3 p-3 text-lg leading-6 font-medium font-rajdhani transition-all duration-300 items-center'
                          )}
                        >
                          <item.icon className={clsx(
                            location.pathname === item.href ? 'text-cyber-blue' : 'text-gray-500 group-hover:text-cyber-blue',
                            "h-6 w-6 shrink-0 transition-colors"
                          )} aria-hidden="true" />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
            <div className="mt-auto pt-6 border-t border-cyber-blue/20">
                <div className="text-xs font-tech text-cyber-blue/50 text-center">
                    SYS.VER.2.0.45 // CONNECTED
                </div>
            </div>
          </div>
        </div>

        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-cyber-blue/20 bg-cyber-black/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button type="button" className="-m-2.5 p-2.5 text-cyber-blue lg:hidden" onClick={() => setSidebarOpen(true)}>
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <div className="flex items-center gap-x-4 lg:gap-x-6 w-full justify-end">
                    <div className="flex items-center space-x-2 px-4 py-1 rounded-full bg-cyber-blue/5 border border-cyber-blue/20">
                        <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse shadow-[0_0_5px_#0aff00]"></div>
                        <span className="font-tech text-cyber-blue text-xs tracking-wider">SYSTEM ONLINE</span>
                    </div>
                </div>
            </div>
          </div>

          <main className="py-10 relative overflow-hidden">
             {/* Background decorative glow */}
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyber-purple/10 via-transparent to-transparent pointer-events-none"></div>
            <div className="px-4 sm:px-6 lg:px-8 relative z-10">
                {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
