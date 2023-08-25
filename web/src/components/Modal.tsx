import { ReactNode } from 'react'
import { Dialog } from '@headlessui/react'
import { classNames } from '../utils'
import { XMarkIcon } from '@heroicons/react/24/outline'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  size?: 'large'
  children: ReactNode
}

// TODO remove after reimplementing the salary component

export default function Modal({ open, setOpen, size, children }: Props) {
  return (
    <Dialog as="div" className="relative z-10" open={open} onClose={setOpen}>
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center text-center">
          <Dialog.Panel
            className={classNames(
              'relative my-8 w-full transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all',
              size === 'large' ? 'max-w-3xl' : 'max-w-sm',
            )}
          >
            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                onClick={() => setOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            {children}
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  )
}
