'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose as DrawerClosePrimitive,
} from '@/components/ui/drawer'
import { useMediaQuery } from '@/hooks/useMediaQuery'

interface CredenzaContextValue {
  isDesktop: boolean
}

const CredenzaContext = React.createContext<CredenzaContextValue>({
  isDesktop: true,
})

function useCredenza() {
  const context = React.useContext(CredenzaContext)
  if (!context) {
    throw new Error('useCredenza must be used within a Credenza')
  }
  return context
}

interface CredenzaProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function Credenza({ children, open, onOpenChange }: CredenzaProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <CredenzaContext.Provider value={{ isDesktop: true }}>
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      </CredenzaContext.Provider>
    )
  }

  return (
    <CredenzaContext.Provider value={{ isDesktop: false }}>
      <Drawer open={open} onOpenChange={onOpenChange}>
        {children}
      </Drawer>
    </CredenzaContext.Provider>
  )
}

const CredenzaTrigger = React.forwardRef<
  React.ElementRef<typeof DialogTrigger>,
  React.ComponentPropsWithoutRef<typeof DialogTrigger>
>(({ className, ...props }, ref) => {
  const { isDesktop } = useCredenza()
  if (isDesktop) {
    return <DialogTrigger ref={ref} className={className} {...props} />
  }
  return <DrawerTrigger ref={ref as any} className={className} {...props} />
})
CredenzaTrigger.displayName = 'CredenzaTrigger'

const CredenzaContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, children, ...props }, ref) => {
  const { isDesktop } = useCredenza()
  if (isDesktop) {
    return (
      <DialogContent ref={ref} className={className} {...props}>
        {children}
      </DialogContent>
    )
  }
  return (
    <DrawerContent ref={ref as any} className={className} {...props}>
      {children}
    </DrawerContent>
  )
})
CredenzaContent.displayName = 'CredenzaContent'

const CredenzaHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { isDesktop } = useCredenza()
  if (isDesktop) {
    return <DialogHeader className={className} {...props} />
  }
  return <DrawerHeader className={className} {...props} />
}
CredenzaHeader.displayName = 'CredenzaHeader'

const CredenzaTitle = React.forwardRef<
  React.ElementRef<typeof DialogTitle>,
  React.ComponentPropsWithoutRef<typeof DialogTitle>
>(({ className, ...props }, ref) => {
  const { isDesktop } = useCredenza()
  if (isDesktop) {
    return <DialogTitle ref={ref} className={className} {...props} />
  }
  return <DrawerTitle ref={ref as any} className={className} {...props} />
})
CredenzaTitle.displayName = 'CredenzaTitle'

const CredenzaDescription = React.forwardRef<
  React.ElementRef<typeof DialogDescription>,
  React.ComponentPropsWithoutRef<typeof DialogDescription>
>(({ className, ...props }, ref) => {
  const { isDesktop } = useCredenza()
  if (isDesktop) {
    return (
      <DialogDescription ref={ref} className={className} {...props} />
    )
  }
  return (
    <DrawerDescription ref={ref as any} className={className} {...props} />
  )
})
CredenzaDescription.displayName = 'CredenzaDescription'

const CredenzaBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('px-6 py-4 overflow-y-auto', className)}
      {...props}
    />
  )
}
CredenzaBody.displayName = 'CredenzaBody'

const CredenzaFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { isDesktop } = useCredenza()
  if (isDesktop) {
    return <DialogFooter className={className} {...props} />
  }
  return <DrawerFooter className={className} {...props} />
}
CredenzaFooter.displayName = 'CredenzaFooter'

const CredenzaClose = React.forwardRef<
  React.ElementRef<typeof DialogClose>,
  React.ComponentPropsWithoutRef<typeof DialogClose>
>(({ className, ...props }, ref) => {
  const { isDesktop } = useCredenza()
  if (isDesktop) {
    return <DialogClose ref={ref} className={className} {...props} />
  }
  return (
    <DrawerClosePrimitive ref={ref as any} className={className} {...props} />
  )
})
CredenzaClose.displayName = 'CredenzaClose'

export {
  Credenza,
  CredenzaTrigger,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaBody,
  CredenzaFooter,
  CredenzaClose,
}
