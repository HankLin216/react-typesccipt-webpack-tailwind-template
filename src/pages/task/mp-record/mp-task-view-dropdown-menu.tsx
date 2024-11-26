import React, { useState, useEffect } from 'react'
import DebouncedInput from '../../../components/input/debounce-input'
import Button17 from '../../../components/button/button-17'
// icons
import FilterListIcon from '@mui/icons-material/FilterList'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
// css
import style from '../../../components/scollbar/styles.module.css'

interface DropdownMenuButtonProps {
  data: DropdownItem[]
  disabled: boolean
  onConfirm: (filterValues: any[]) => void
  onCancel: () => void
  onActivateIcon?: JSX.Element
  icon?: JSX.Element
  position?: 'left' | 'right'
}

interface DropdownItem {
  label: string
  value: string
  checked: boolean
}

const DropdownMenu = ({
  data,
  disabled,
  onConfirm,
  onCancel,
  onActivateIcon = <FilterAltIcon />,
  icon = <FilterListIcon />,
  position = 'right',
}: DropdownMenuButtonProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const [visibleData, setVisibleData] = useState<DropdownItem[]>(data)
  const [isAllChecked, setIsAllChecked] = useState<boolean>(false)
  const [filterValue, setFilterValue] = useState<string>('')

  useEffect(() => {
    const newVisibleData = mergeVisibleData(data, filterValue)
    setVisibleData(newVisibleData)
  }, [data])

  const toggleMenu = (): void => {
    setIsOpen(!isOpen)
  }

  const onCheck = (idx: number): void => {
    const newVisibleData = [...visibleData]
    newVisibleData[idx].checked = !newVisibleData[idx].checked
    setIsAllChecked(newVisibleData.every((item) => item.checked))
    setVisibleData(newVisibleData)
  }

  const onCheckAll = (): void => {
    setIsAllChecked((pre) => {
      return !pre
    })

    const newVisibleData = visibleData.map((item) => ({ ...item, checked: !isAllChecked }))
    setVisibleData(newVisibleData)
  }

  const onFilter = (v: string): void => {
    if (filterValue === '' && v === '') return

    setFilterValue(v)

    const newVisibleData = mergeVisibleData(data, v)
    setIsAllChecked(newVisibleData.length > 0 && newVisibleData.every((item) => item.checked))
    setVisibleData(newVisibleData)
  }

  const onConfirmAction = (): void => {
    setIsOpen(false)

    const filterValues = visibleData.filter((item) => item.checked).map((item) => item.value)
    onConfirm(filterValues)
  }

  const onCancelAction = (): void => {
    // clear all
    setIsAllChecked(false)
    setVisibleData(data.map((item) => ({ ...item, checked: false })))
    setIsOpen(false)

    onCancel()
  }

  const mergeVisibleData = (data: DropdownItem[], filterValue: string): DropdownItem[] => {
    const newVisibleData = []
    const comingData = data.map((item) => ({ ...item, checked: false }))

    const fData = comingData.filter((item) => {
      if (item.value === null || item.value === undefined) {
        return false
      }

      return item.value.toLowerCase().includes(filterValue.toLowerCase())
    })

    for (let i = 0; i < fData.length; i++) {
      let found = false
      for (let j = 0; j < visibleData.length; j++) {
        if (fData[i].value === visibleData[j].value) {
          found = true
          newVisibleData.push(visibleData[j])
          break
        }
      }
      if (!found) {
        newVisibleData.push(fData[i])
      }
    }
    return newVisibleData
  }

  return (
    <div className="relative">
      <button
        disabled={disabled}
        className={`p-2.5 text-center 
        text-sm transition-all
        ${isOpen ? 'text-gray-800' : 'text-gray-400'}
        ${!disabled ? 'hover:text-gray-800' : ''}
        type="button`}
        onClick={toggleMenu}
      >
        {visibleData.some((item: DropdownItem) => item.checked) ? onActivateIcon : icon}
      </button>
      {isOpen && (
        <ul
          role="menu"
          className={`${style['custom-scrollbar']} absolute top-12 ${
            position === 'left' ? 'right-5' : ''
          } min-w-[180px] min-h-[150px] max-h-[250px] overflow-auto border bg-white shadow-lg focus:outline-none z-50`}
        >
          {/* filter input & all checkbox */}
          <div className="sticky top-0 bg-white px-2 pt-2">
            <DebouncedInput
              value={filterValue}
              className="mb-1 w-full"
              onChange={(v) => {
                onFilter(v)
              }}
              debounce={500}
              placeholder="filter..."
              type="text"
            ></DebouncedInput>
            <div className="h-1 border-b-2"></div>
            {/* all */}
            <li
              role="menuitem"
              onClick={() => {
                if (visibleData.length !== 0) onCheckAll()
              }}
              className={`${
                visibleData.length !== 0 ? 'cursor-pointer' : ''
              }  flex w-full text-sm items-center p-1 mt-2 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100 relative`}
            >
              <input
                disabled={visibleData.length === 0}
                className={`${
                  visibleData.length !== 0 ? 'cursor-pointer' : ''
                }  hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100 mr-2`}
                type="checkbox"
                checked={isAllChecked}
                onChange={() => {}}
              ></input>
              <label className={`${visibleData.length !== 0 ? 'cursor-pointer' : ''}`}>All</label>
            </li>
          </div>
          {/* data set .... */}
          <div className="px-2 pb-2">
            {visibleData.map((item, idx) => {
              return (
                <li
                  key={item.value}
                  role="menuitem"
                  className="cursor-pointer flex w-full text-sm items-center p-1 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100 "
                  onClick={(_) => {
                    onCheck(idx)
                  }}
                >
                  <input
                    className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100 mr-2"
                    type="checkbox"
                    checked={item.checked ?? false}
                    onChange={(_) => {}}
                  ></input>
                  <label className="cursor-pointer">{item.label}</label>
                </li>
              )
            })}
          </div>
          {/* action button */}
          <div className="sticky bottom-0 bg-white flex p-2 justify-end items-center shadow">
            <Button17
              onClick={() => {
                onConfirmAction()
              }}
              text="Confrim"
              className="mx-1"
            ></Button17>
            <Button17
              onClick={() => {
                onCancelAction()
              }}
              text="Cancel"
              className="mx-1"
            ></Button17>
          </div>
        </ul>
      )}
    </div>
  )
}

export default DropdownMenu
export type { DropdownItem, DropdownMenuButtonProps }
