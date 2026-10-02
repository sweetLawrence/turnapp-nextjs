"use client"

import { Loader2, Save } from 'lucide-react'
import { Button } from '../ui/button'

const MobileSubmitBar = ({ loading }) => {
  return (
    <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-800 p-4 z-50'>
      <Button
        type='submit'
        className='w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 text-base rounded-xl'
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className='h-5 w-5 animate-spin mr-2' /> Creating...
          </>
        ) : (
          <>
            <Save className='h-5 w-5 mr-2' /> Launch Event
          </>
        )}
      </Button>
    </div>
  )
}

export default MobileSubmitBar
