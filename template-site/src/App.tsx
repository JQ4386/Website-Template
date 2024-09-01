import React, { useState, useEffect, useRef } from 'react';
import { Search, Check, X } from 'lucide-react'
import { Input } from "./components/ui/input"
import { Button } from "./components/ui/button"
import { Card, CardContent } from "./components/ui/card"
import { Skeleton } from "./components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip"
// import html2canvas from 'html2canvas';

import './index.css';

// Mock data for demonstration
const mockFamilies = [
  {
    familyCode: "DOE001",
    semester: "Fall 2023",
    parents: ["Jane Doe", "Jack Doe"],
    children: [
      { name: "John Doe", studentId: "LW24010", classes: [
        { code: "SCI 9A", name: "周一 4:15 ｜ Y9 Science", weeks: 10, costPerSession: 50 },
        { code: "MAT 9A", name: "Y9 Math", weeks: 12, costPerSession: 55 }
      ]},
      { name: "Jane Doe", studentId: "LW24011", classes: [
        { code: "SCI 9A", name: "Y9 Science", weeks: 10, costPerSession: 50 },
        { code: "ENG 9A", name: "Y9 English", weeks: 11, costPerSession: 45 }
      ]}
    ],
    existingCredit: 100,
    discount: 50
  },
  {
    familyCode: "SMITH001",
    semester: "Fall 2023",
    parents: ["Bob Smith", "Alice Smith"],
    children: [
      { name: "Tom Smith", studentId: "LW24012", classes: [
        { code: "ENG 10A", name: "Y10 English", weeks: 12, costPerSession: 55 },
        { code: "ART 10A", name: "Y10 Art", weeks: 8, costPerSession: 60 }
      ]},
      { name: "Emma Smith", studentId: "LW24013", classes: [
        { code: "PHY 10A", name: "Y10 Physics", weeks: 11, costPerSession: 65 },
        { code: "CHE 10A", name: "Y10 Chemistry", weeks: 11, costPerSession: 65 }
      ]}
    ],
    existingCredit: 50,
    discount: 25
  },
]

const mockPaymentStatus = {
  sent: true,
  paid: false,
  paymentDate: "2023-06-15",
  paymentMethod: "Credit Card"
}

export default function Component() {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedFamily, setSelectedFamily] = useState<null | {
    familyCode: string;
    semester: string;
    parents: string[];
    children: {
      name: string;
      studentId: string;
      classes: {
        code: string;
        name: string;
        weeks: number;
        costPerSession: number;
      }[];
    }[];
    existingCredit: number;
    discount: number;
  }>(null)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [showSubmitButton, setShowSubmitButton] = useState(true)
  const [showBillInterface, setShowBillInterface] = useState(false)
  const searchRef = useRef<HTMLElement | null>(null)
  const dropdownRef = useRef<HTMLUListElement | null>(null)
  const billRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const filteredStudents = mockFamilies.flatMap(family => 
      family.children.filter(child => 
        child.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    setSuggestions(filteredStudents.map(student => `${student.name} (${student.studentId})`))
  }, [searchTerm])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (searchRef.current as HTMLElement) && 
        !(searchRef.current as HTMLElement).contains(event.target as Node) && 
        (dropdownRef.current as HTMLElement) && 
        !(dropdownRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
        if (hasSearched) {
          setShowSubmitButton(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [hasSearched])

  const handleSearch = () => {
    setIsLoading(true)
    setError(null)
    setHasSearched(true)
    setShowSubmitButton(false)

    setTimeout(() => {
      const family = mockFamilies.find(f => 
        f.children.some(child => child.name.toLowerCase() === searchTerm.toLowerCase() || child.studentId === searchTerm)
      )
      
      if (family) {
        setSelectedFamily(family)
      } else {
        setError("No family found matching the search criteria.")
        setSelectedFamily(null)
      }
      setIsLoading(false)
    }, 1500)
    
    setIsSearchFocused(false)
  }

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion.split(' (')[0])
    setSuggestions([])
    setIsSearchFocused(false)
  }

  const handleGenerateBill = () => {
    setShowBillInterface(true)
  }

  const subtotal = selectedFamily ? selectedFamily.children.reduce((sum, child) => 
    sum + child.classes.reduce((classSum, cls) => classSum + (cls.weeks * cls.costPerSession), 0), 0
  ) : 0

  const existingCredit = selectedFamily ? selectedFamily.existingCredit : 0
  const discount = selectedFamily ? selectedFamily.discount : 0
  const gst = (subtotal - discount) * 0.1
  const totalAmountDue = subtotal - existingCredit - discount + gst

  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-full min-w-[1000px] max-w-[1100px] mx-auto px-4">
        {!showBillInterface && (
          <div className="py-3 px-6 text-center text-xl font-bold rounded-t-lg bg-primary text-primary-foreground">
            Generate Family Billing
          </div>
        )}
        <Card className={`rounded-b-lg shadow-md overflow-hidden ${!showBillInterface ? 'border-t-0' : ''}`}>
          <CardContent className="p-8">
            {!showBillInterface ? (
              <>
                <div className="relative mb-6 group">
                  <div className="flex items-center">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-hover:text-foreground transition-colors duration-100" />
                    <Input
                      type="text"
                      placeholder="Search Student Name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => {
                        setIsSearchFocused(true)
                        setShowSubmitButton(true)
                      }}
                      className="pl-10 pr-4 py-2 w-full border border-input hover:border-foreground focus:border-foreground focus:ring-1 focus:ring-ring rounded-md transition-all duration-100"
                      ref={searchRef as React.RefObject<HTMLInputElement>}
                    />
                  </div>
                  {isSearchFocused && suggestions.length > 0 && (
                    <ul ref={dropdownRef} className="absolute z-10 w-full bg-popover border border-input mt-1 rounded-md shadow-lg max-h-60 overflow-auto animate-fadeIn">
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="px-4 py-2 hover:bg-muted cursor-pointer transition-colors duration-100 text-popover-foreground"
                          onClick={() => handleSelectSuggestion(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {showSubmitButton && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleSearch}
                        className="mb-6 w-full max-w-3xl mx-auto block bg-primary text-primary-foreground hover:bg-primary-foreground hover:text-primary border border-primary transition-all duration-100"
                        aria-label="Submit search"
                      >
                        Submit
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      <p>Search for a family based on the entered student name or ID</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {hasSearched && (
                  <div className="space-y-6">
                    {isLoading ? (
                      <>
                        <div className="space-y-2">
                          <Skeleton className="h-8 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>

                        <div className="border-t border-foreground pt-6">
                          <Skeleton className="h-6 w-1/4 mb-4" />
                          <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                              <Card key={i} className="p-3 border-foreground">
                                <div className="flex justify-between items-center mb-1">
                                  <Skeleton className="h-4 w-1/3" />
                                  <Skeleton className="h-4 w-1/4" />
                                </div>
                                <div className="flex justify-between">
                                  <Skeleton className="h-3 w-1/6" />
                                  <Skeleton className="h-3 w-1/6" />
                                  <Skeleton className="h-3 w-1/6" />
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-foreground pt-6">
                          <Skeleton className="h-6 w-1/4 mb-4" />
                          <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="flex items-center">
                                <Skeleton className="h-4 w-1/4 mr-2" />
                                <Skeleton className="h-6 w-1/2 rounded-full" />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-foreground pt-6">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex justify-between items-center">
                              <Skeleton className="h-4 w-1/4" />
                              <Skeleton className="h-4 w-1/6" />
                            </div>
                          ))}
                        </div>
                      </>
                    ) : error ? (
                      <div className="text-center text-red-500 font-semibold">{error}</div>
                    ) : selectedFamily ? (
                      <>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">Family Code: {selectedFamily.familyCode}</h2>
                          <p><strong>Semester:</strong> {selectedFamily.semester}</p>
                          <p><strong>Parent Name(s):</strong> {selectedFamily.parents.join(', ')}</p>
                        </div>

                        <div className="border-t border-foreground pt-6">
                          <h3 className="text-xl font-semibold text-foreground mb-4">Payment Details</h3>
                          <div className="space-y-2">
                            {selectedFamily.children.flatMap(child =>
                              child.classes.map((cls) => (
                                <Card key={`${child.studentId}-${cls.code}`} className="p-3 border-foreground">
                                  <div className="flex justify-between items-center mb-1">
                                    <p className="font-semibold">{child.name} | {child.studentId}</p>
                                    <p className="font-semibold">{cls.name}</p>
                                  </div>
                                  <div className="text-sm text-muted-foreground flex justify-between">
                                    <span>Weeks: {cls.weeks}</span>
                                    <span>Cost/Session: ${cls.costPerSession}</span>
                                    <span className="font-semibold">Total: ${cls.weeks * cls.costPerSession}</span>
                                  </div>
                                </Card>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="border-t border-foreground pt-6">
                          <h3 className="text-xl font-semibold text-foreground mb-4">Payment Status</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center">
                              <span className="font-semibold mr-2">Sent:</span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${mockPaymentStatus.sent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {mockPaymentStatus.sent ? <Check className="w-4 h-4 mr-1" /> : <X className="w-4 h-4 mr-1" />}
                                {mockPaymentStatus.sent ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-semibold mr-2">Paid:</span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${mockPaymentStatus.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {mockPaymentStatus.paid ? <Check className="w-4 h-4 mr-1" /> : <X className="w-4 h-4 mr-1" />}
                                {mockPaymentStatus.paid ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-semibold mr-2">Payment Date:</span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {mockPaymentStatus.paymentDate}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-semibold mr-2">Payment Method:</span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {mockPaymentStatus.paymentMethod}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-foreground pt-6">
                          <div className="flex justify-between items-center">
                            <p className="text-lg font-semibold">Subtotal:</p>
                            <p className="text-lg">${subtotal}</p>
                          </div>
                          <div className="flex justify-between items-center text-muted-foreground">
                            <p className="text-lg">Discount:</p>
                            <p className="text-lg">- ${discount}</p>
                          </div>
                          <div className="flex justify-between items-center text-muted-foreground">
                            <p className="text-lg">Existing Credit:</p>
                            <p className="text-lg">- ${existingCredit}</p>
                          </div>
                          <div className="flex justify-between items-center text-muted-foreground">
                            <p className="text-lg">GST (10%):</p>
                            <p className="text-lg">${gst.toFixed(2)}</p>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <p className="text-xl font-bold text-foreground">Total Amount Due:</p>
                            <p className="text-xl font-bold text-foreground">${totalAmountDue.toFixed(2)}</p>
                          </div>
                        </div>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              onClick={handleGenerateBill}
                              className="w-full bg-primary text-primary-foreground hover:bg-primary-foreground hover:text-primary border border-primary transition-all duration-100"
                              aria-label="Generate bill"
                            >
                              Generate Bill
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="center" sideOffset={5}>
                            <p>Create and display the bill for the selected family</p>
                          </TooltipContent>
                        </Tooltip>
                      </>
                    ) : null}
                  </div>
                )}
              </>
            ) : (
              <div ref={billRef} className="space-y-6">
                <div className="w-full max-w-[1000px] h-[165px] mx-auto bg-gray-200 flex items-center justify-center text-gray-500">
                  Logo Placeholder (5000x824 scaled to fit)
                </div>

                <div className="border-t border-foreground pt-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Payment Details</h3>
                  <div className="space-y-2">
                    {selectedFamily?.children.flatMap(child =>
                      child.classes.map((cls) => (
                        <Card key={`${child.studentId}-${cls.code}`} className="p-3 border-foreground">
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-semibold">{child.name} | {child.studentId}</p>
                            <p className="font-semibold">{cls.name}</p>
                          </div>
                          <div className="text-sm text-muted-foreground flex justify-between">
                            <span>Weeks: {cls.weeks}</span>
                            <span>Cost/Session: ${cls.costPerSession}</span>
                            <span className="font-semibold">Total: ${cls.weeks * cls.costPerSession}</span>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-6">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold">Subtotal:</p>
                    <p className="text-lg">${subtotal}</p>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <p className="text-lg">Discount:</p>
                    <p className="text-lg">- ${discount}</p>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <p className="text-lg">Existing Credit:</p>
                    <p className="text-lg">- ${existingCredit}</p>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <p className="text-lg">GST (10%):</p>
                    <p className="text-lg">${gst.toFixed(2)}</p>
                  </div>
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-muted-foreground"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-2 text-sm text-muted-foreground">Total Amount Due</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xl font-bold text-foreground">Total Amount Due:</p>
                    <p className="text-xl font-bold text-foreground">${totalAmountDue.toFixed(2)}</p>
                  </div>
                </div>

                <div className="border-t border-foreground pt-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Payment Details</h3>
                  <p><strong>ACC Name:</strong> Australian Biomed</p>
                  <p><strong>BSB:</strong> 063 245</p>
                  <p><strong>ACC Number:</strong> 1116 0066</p>
                </div>

                <p className="text-primary font-semibold text-lg">请一定要填写学生英文全名和学生号，并截图发回，谢谢</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}