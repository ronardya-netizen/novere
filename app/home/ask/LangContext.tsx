'use client'
import { createContext, useContext } from 'react'


export const LangContext = createContext<{ lang: 'fr' | 'cr'; setLang: (l: 'fr' | 'cr') => void }>({
  lang: 'fr', setLang: () => {}
})


export const useLang = () => useContext(LangContext)


