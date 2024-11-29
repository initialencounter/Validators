import { PekData, PekPkgInfo, PekUNNO, PkgInfoSubType } from "../types/index"

function matchWattHour(projectName: string) {
  const matches = [...projectName.matchAll(/\s(\d+\.?\d+)[Kk]?[Ww][Hh]/g)]
  const results = matches.map((match) => match[1])
  let wattHour = Number(results[0])
  if (!results.length) return 0
  if (isNaN(wattHour)) return 0
  if (projectName.toLowerCase().includes('kwh')) wattHour *= 1000
  return wattHour
}

function getBtyTypeCode(
  currentData: PekData
): '500' | '501' | '502' | '503' | '504' | '505' {
  const isIon: boolean = String(currentData['type1']) === '1'
  const isCell: boolean = String(currentData['type2']) === '1'
  const isSingleCell: boolean = currentData['otherDescribe'].includes('1790')
  if (isIon) {
    if (isCell) return '501'
    else return isSingleCell ? '504' : '500'
  } else {
    if (isCell) return '503'
    else return isSingleCell ? '505' : '502'
  }
}

function getIsSingleCell(
  // 锂离子电池 锂离子电芯 锂金属电池 锂金属电芯 单芯锂离子电池 单芯锂金属电池
  // '500'     | '501'   | '502'   | '503'   | '504'       | '505'
  btyType: '500' | '501' | '502' | '503' | '504' | '505'
) {
  return !['500', '502'].includes(btyType)
}

function pekIsDangerous(
  wattHour: number,
  pkgInfo: PekPkgInfo,
  liContent: number,
  netWeight: number,
  isSingleCell: boolean
): boolean {
  if (wattHour > 100) return true
  if (wattHour > 20 && isSingleCell) return true
  if (liContent > 2) return true
  if (liContent > 1 && isSingleCell) return true
  switch (pkgInfo) {
    case '965':
    case '968':
    case '952':
      return true
    case '966':
    case '967':
    case '969':
    case '970':
      return netWeight > 5;

  }
  return false
}

function getPkgInfo(
  unNo: PekUNNO,
  isIon: boolean,
  otherDescribe: '0' | '1' | '2'
): PekPkgInfo {
  switch (otherDescribe) {
    case '0':
      return isIon ? '965' : '968'
    case '1':
      return isIon ? '966' : '969'
    case '2':
      if (unNo === 'UN3171' || unNo === 'UN3556' || unNo === 'UN3557') {
        return '952'
      }
      return isIon ? '967' : '970'
  }
}

function isBatteryLabel(
  pkgInfoSubType: PkgInfoSubType,
  shape: string,
): boolean {
  switch (pkgInfoSubType) {
    case '952':
    case '965, IA':
    case '966, I':
    case '967, I':
    case '968, IA':
    case '969, I':
    case '970, I':
      return false;
    case '970, II':
      return shape !== '8aad92b65aae82c3015ab094788a0026';
    case '965, IB':
    case '966, II':
    case '967, II':
    case '968, IB':
    case '969, II':
      return true
  }
  return false
}

function getPkgInfoByPackCargo(
  inspectionItem5Text1: PekPkgInfo,
  packCargo: string
): PekPkgInfo {
  let pkgInfo = getPkgInfoSubType(inspectionItem5Text1, packCargo)
  return pkgInfo === '' ? '' : pkgInfo.slice(0, 3) as PekPkgInfo
}

function getPkgInfoSubType(
  inspectionItem5Text1: PekPkgInfo,
  packCargo: string
): PkgInfoSubType {
  if (inspectionItem5Text1 === '' && packCargo === '') return ''
  let clearPackCargo = packCargo.replace(/[^a-zA-Z0-9]/g, '')
  if (!clearPackCargo.length) return inspectionItem5Text1 + ', II' as PkgInfoSubType
  if (clearPackCargo.length < 3) return '' as PkgInfoSubType
  if (clearPackCargo === '952') return '952'
  let subType = clearPackCargo.replace(/[^A-Z]/g, '')
  return `${clearPackCargo.slice(0, 3)}, ${subType}` as PkgInfoSubType
}

function getUNNO(
  pkgInfo: PekPkgInfo
): PekUNNO {
  switch (pkgInfo) {
    case '965':
      return 'UN3480'
    case '966':
    case '967':
      return 'UN3481'
    case '968':
      return 'UN3090'
    case '969':
    case '970':
      return 'UN3091'
  }
  return ''
}

function getIsCargoOnly(
  pkgInfo: PekPkgInfo,
  netWeight: number
) {
  switch (pkgInfo) {
    case '965':
    case '968':
      return true
    case '966':
    case '967':
    case '969':
    case '970':
      if (netWeight > 5) return true
  }
}

function pkgInfoIsIA(
  wattHour: number,
  pkgInfo: PekPkgInfo,
  liContent: number,
  netWeight: number,
  isSingleCell: boolean
): boolean {
  if (pkgInfo === '965') {
      if (wattHour > 100) {
          return true;
      }
      if (isSingleCell && wattHour > 20) {
          return true;
      }
      if (netWeight > 10) {
          return true;
      }
      return false;
  }
  if (pkgInfo === '968') {
      if (liContent > 2) {
          return true;
      }
      if (isSingleCell && liContent > 1) {
          return true;
      }
      return netWeight > 2.5;

  }
  return false;
}


export { matchWattHour, getBtyTypeCode, getIsSingleCell, pekIsDangerous, 
  getPkgInfo, isBatteryLabel, getPkgInfoByPackCargo, getPkgInfoSubType, 
  getUNNO, getIsCargoOnly, pkgInfoIsIA }