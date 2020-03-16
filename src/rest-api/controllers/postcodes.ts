import axios from 'axios'
import { NextFunction, Request, Response } from 'express'
import * as naturalSort from 'javascript-natural-sort'
import * as groupBy from 'lodash/groupBy'
import * as proj4 from 'proj4'

proj4.defs([
  ['WGS84', '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs'],
  [
    'EPSG:27700',
    '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs',
  ],
])

const projections = {
  standard: new proj4.Proj('WGS84'),
  ordnanceSurvey: new proj4.Proj('EPSG:27700'),
}

const CODES = {
  Commercial: { code: 'C', value: 'commercial', description: 'Commercial' },
  'Commercial,': {
    code: 'CR',
    value: 'commercial.retail',
    description: 'Retail',
  },
  'Commercial, Ancillary Buildings': {
    code: 'CB',
    value: 'commercial.ancilliary',
    description: 'Ancillary Building',
  },
  'Commercial, Animal Centre, Vet or Animal Medical Treatment': {
    code: 'CN04',
    value: 'commercial.animals.vet',
    description: 'Vet / Animal Medical Treatment',
  },
  'Commercial, , Automated Teller Machines (ATM)': {
    code: 'CR11',
    value: 'commercial.retail.atm',
    description: 'Automated Teller Machine (ATM)',
  },
  'Commercial, , Bus Shelters': {
    code: 'CT02',
    value: 'commercial.transport.bus',
    description: 'Bus Shelter',
  },
  'Commercial, , Church Halls': {
    code: 'CC07',
    value: 'commercial.community.religious',
    description: 'Church Hall / Religious Meeting Place / Hall',
  },
  'Commercial, Community Services': {
    code: 'CC',
    value: 'commercial.community',
    description: 'Community Services',
  },
  'Commercial, Community Services,': {
    code: 'CC08',
    value: 'commercial.community.services',
    description: 'Community Service Centre / Office',
  },
  'Commercial, Community Services, Cemeteries and Crematoria': {
    code: 'CC06',
    value: 'commercial.community.cemetary',
    description: 'Cemetery / Crematorium / Graveyard. In Current Use.',
  },
  'Commercial, Community Services, Church halls': {
    code: 'CC07',
    value: 'commercial.community.religious',
    description: 'Church Hall / Religious Meeting Place / Hall',
  },
  'Commercial, Community Services, Church Halls': {
    code: 'CC07',
    value: 'commercial.community.religious',
    description: 'Church Hall / Religious Meeting Place / Hall',
  },
  'Commercial, Community Services, Community Service Centres': {
    code: 'CC08',
    value: 'commercial.community.services',
    description: 'Community Service Centre / Office',
  },
  'Commercial, Community Services, Household Waste Recycling Centre': {
    code: 'CC09',
    value: 'commercial.community.HWRC',
    description: 'Public Household Waste Recycling Centre (HWRC)',
  },
  'Commercial, Community Services, Prisons': {
    code: 'CC03',
    value: 'commercial.community.prison',
    description: 'Prison',
  },
  'Commercial, Community Services, Public and village halls': {
    code: 'CC04',
    value: 'commercial.community.hall',
    description: 'Public / Village Hall / Other Community Facility',
  },
  'Commercial, Community Services, Public and Village Halls': {
    code: 'CC04',
    value: 'commercial.community.hall',
    description: 'Public / Village Hall / Other Community Facility',
  },
  'Commercial, Community Services, Public Conveniences': {
    code: 'CC05',
    value: 'commercial.community.wc',
    description: 'Public Convenience',
  },
  'Commercial, , Dentist': {
    code: 'CM01',
    value: 'commercial.medical.dentist',
    description: 'Dentist',
  },
  'Commercial, Education': {
    code: 'CE',
    value: 'commercial.education',
    description: 'Education',
  },
  'Commercial, Education,': {
    code: 'CE02',
    value: 'commercial.education.nursery',
    description: 'Children’s Nursery / Crèche',
  },
  'Commercial, Education, Colleges': {
    code: 'CE01',
    value: 'commercial.education.college',
    description: 'College',
  },
  'Commercial, Education, Education': {
    code: 'CE05',
    value: 'commercial.education.university',
    description: 'University',
  },
  'Commercial, Education, Nursery/creche': {
    code: 'CE02',
    value: 'commercial.education.nursery',
    description: 'Children’s Nursery / Crèche',
  },
  'Commercial, Education, Nursery/Creche': {
    code: 'CE02',
    value: 'commercial.education.nursery',
    description: 'Children’s Nursery / Crèche',
  },
  'Commercial, Education, Other Educational Establishments': {
    code: 'CE07',
    value: 'commercial.education.other',
    description: 'Other Educational Establishment',
  },
  'Commercial, Education, Primary, Junior, Infants or Middle School': {
    code: 'CE03',
    value: 'commercial.education.school',
    description:
      'Preparatory / First / Primary / Infant / Junior / Middle School',
  },
  'Commercial, Education, Secondary School': {
    code: 'CE04',
    value: 'commercial.education.secondarySchool',
    description: 'Secondary / High School',
  },
  'Commercial, Education, Special Needs Establishments': {
    code: 'CE06',
    value: 'commercial.education.specialNeeds',
    description: 'Special Needs Establishment.',
  },
  'Commercial, Education, Universities': {
    code: 'CE05',
    value: 'commercial.education.university',
    description: 'University',
  },
  'Commercial, , GP Surgeries and Clinics': {
    code: 'CM02',
    value: 'commercial.medical.GP',
    description: 'General Practice Surgery / Clinic',
  },
  'Commercial, Hotels, Boarding and Guest Houses': {
    code: 'CH',
    value: 'commercial.guest',
    description: 'Hotel / Motel / Boarding / Guest House',
  },
  'Commercial, Hotels, Boarding and Guest Houses,': {
    code: 'CH03',
    value: 'commercial.guest.hotel',
    description: 'Hotel/Motel',
  },
  'Commercial, Hotels, Boarding and Guest Houses, Guest House/ B&B/ Youth Hostel': {
    code: 'CH01',
    value: 'commercial.guest.hostel',
    description: 'Boarding / Guest House / Bed And Breakfast / Youth Hostel',
  },
  'Commercial, Hotels Boarding and Guest Houses, Hotel': {
    code: 'CH03',
    value: 'commercial.guest.hotel',
    description: 'Hotel/Motel',
  },
  'Commercial, Hotels, Boarding and Guest Houses, Hotel': {
    code: 'CH03',
    value: 'commercial.guest.hotel',
    description: 'Hotel/Motel',
  },
  'Commercial, Industrial': {
    code: 'CI',
    value: 'commercial.industrial',
    description:
      'Industrial Applicable to manufacturing, engineering, maintenance, storage / wholesale distribution and extraction sites',
  },
  'Commercial, Industrial,': {
    code: 'CI04',
    value: 'commercial.industrial.light.storage',
    description: 'Warehouse / Store / Storage Depot',
  },
  'Commercial, Industrial, Factories and Manufacturing': {
    code: 'CI01',
    value: 'commercial.industrial.manufacturing',
    description: 'Factory/Manufacturing',
  },
  'Commercial, Industrial, Warehouses, Stores and Storage Depots': {
    code: 'CI04',
    value: 'commercial.industrial.light.storage',
    description: 'Warehouse / Store / Storage Depot',
  },
  'Commercial, Industrial, Workshops and Light Industrial': {
    code: 'CI03',
    value: 'commercial.industrial.light',
    description: 'Workshop / Light Industrial',
  },
  'Commercial, Leisure': {
    code: 'CL',
    value: 'commercial.leisure',
    description: 'Leisure - Applicable to recreational sites and enterprises',
  },
  'Commercial, Leisure,': {
    code: 'CL06',
    value: 'commercial.leisure.sport',
    description: 'Indoor / Outdoor Leisure / Sporting Activity / Centre',
  },
  'Commercial, Leisure, Indoor and outdoor leisure and sporting activities': {
    code: 'CL06',
    value: 'commercial.leisure.sport',
    description: 'Indoor / Outdoor Leisure / Sporting Activity / Centre',
  },
  'Commercial, Leisure, Libraries': {
    code: 'CL03',
    value: 'commercial.leisure.library',
    description: 'Library',
  },
  'Commercial, Leisure, Museums and Galleries': {
    code: 'CL04',
    value: 'commercial.leisure.museum',
    description: 'Museum / Gallery',
  },
  'Commercial, Leisure, Theatres, Cinemas, Bingo and Conference Centres': {
    code: 'CL07',
    value: 'commercial.leisure.entertainment',
    description:
      'Bingo Hall / Cinema / Conference / Exhibition Centre / Theatre / Concert Hall',
  },
  'Commercial, Medical': {
    code: 'CM',
    value: 'commercial.medical',
    description: 'Medical',
  },
  'Commercial, Medical,': {
    code: 'CM02',
    value: 'commercial.medical.GP',
    description: 'General Practice Surgery / Clinic',
  },
  'Commercial, Medical, Dentist': {
    code: 'CM01',
    value: 'commercial.medical.dentist',
    description: 'Dentist',
  },
  'Commercial, Medical, GP surgeries and clinics': {
    code: 'CM02',
    value: 'commercial.medical.GP',
    description: 'General Practice Surgery / Clinic',
  },
  'Commercial, Medical, GP Surgeries and Clinics': {
    code: 'CM02',
    value: 'commercial.medical.GP',
    description: 'General Practice Surgery / Clinic',
  },
  'Commercial, Medical, Hospitals and Hospices': {
    code: 'CM03',
    value: 'commercial.medical.care',
    description: 'Hospital / Hospice',
  },
  'Commercial, Medical, Professional Medical Services': {
    code: 'CM05',
    value: 'commercial.medical.professional',
    description: 'Professional Medical Service',
  },
  'Commercial, Offices': {
    code: 'CO',
    value: 'commercial.office',
    description: 'Office',
  },
  'Commercial, Offices,': {
    code: 'CO01',
    value: 'commercial.office.workspace',
    description: 'Office / Work Studio',
  },
  'Commercial, , Offices and Work Studios': {
    code: 'CO01',
    value: 'commercial.office.workspace',
    description: 'Office / Work Studio',
  },
  'Commercial, Offices, Offices and work studios': {
    code: 'CO01',
    value: 'commercial.office.workspace',
    description: 'Office / Work Studio',
  },
  'Commercial, Offices, Offices and Work Studios': {
    code: 'CO01',
    value: 'commercial.office.workspace',
    description: 'Office / Work Studio',
  },
  'Commercial, , Other Licensed Premises/ Vendors': {
    code: 'CR09',
    value: 'commercial.retail.licensedPremises',
    description: 'Other Licensed Premise / Vendor',
  },
  'Commercial, , Primary, Junior, Infants or Middle School': {
    code: 'CE03',
    value: 'commercial.education.school',
    description:
      'Preparatory / First / Primary / Infant / Junior / Middle School',
  },
  'Commercial, , Pubs, Bars and Nightclubs': {
    code: 'CR06',
    value: 'commercial.retail.drinking',
    description: 'Public House / Bar / Nightclub',
  },
  'Commercial, Retail': {
    code: 'CR',
    value: 'commercial.retail',
    description: 'Retail',
  },
  'Commercial, Retail,': {
    code: 'CR08',
    value: 'commercial.retail.showroom',
    description: 'Shop / Showroom',
  },
  'Commercial, Retail, Automated Teller Machines (ATM)': {
    code: 'CR11',
    value: 'commercial.retail.atm',
    description: 'Automated Teller Machine (ATM)',
  },
  'Commercial, Retail, Banks/Financial Services': {
    code: 'CR01',
    value: 'commercial.retail.financial',
    description: 'Bank / Financial Service',
  },
  'Commercial, Retail, Fast food Outlets/ Takeaways': {
    code: 'CR10',
    value: 'commercial.retail.takeaway',
    description: 'Fast Food Outlet / Takeaway (Hot / Cold)',
  },
  'Commercial, Retail, Markets (indoor and outdoor)': {
    code: 'CR04',
    value: 'commercial.retail.market',
    description: 'Market (Indoor / Outdoor)',
  },
  'Commercial, Retail, Markets (Indoor and Outdoor)': {
    code: 'CR04',
    value: 'commercial.retail.market',
    description: 'Market (Indoor / Outdoor)',
  },
  'Commercial, Retail, Other Licensed Premises/ Vendors': {
    code: 'CR09',
    value: 'commercial.retail.licensedPremises',
    description: 'Other Licensed Premise / Vendor',
  },
  'Commercial, Retail, Petrol Filling Stations': {
    code: 'CR05',
    value: 'commercial.retail.fuel',
    description: 'Petrol Filling Station',
  },
  'Commercial, Retail, Pubs, Bars and Nightclubs': {
    code: 'CR06',
    value: 'commercial.retail.drinking',
    description: 'Public House / Bar / Nightclub',
  },
  'Commercial, Retail, Restaurants and Cafes': {
    code: 'CR07',
    value: 'commercial.retail.restaurant',
    description: 'Restaurant / Cafeteria',
  },
  'Commercial, Retail, Retail Service Agents': {
    code: 'CR02',
    value: 'commercial.retail.services',
    description: 'Retail Service Agent',
  },
  'Commercial, Retail, Shops and Showrooms': {
    code: 'CR08',
    value: 'commercial.retail.showroom',
    description: 'Shop / Showroom',
  },
  'Commercial, , Secondary School': {
    code: 'CE04',
    value: 'commercial.education.secondarySchool',
    description: 'Secondary / High School',
  },
  'Commercial, Storage Land': {
    code: 'CS',
    value: 'commercial.storageLand',
    description: 'Storage Land',
  },
  "Commercial, Storage Land, Builders' Yards": {
    code: 'CS02',
    value: 'commercial.storageLand.building',
    description: 'Builders’ Yard',
  },
  'Commercial, Transport': {
    code: 'CT',
    value: 'commercial.transport',
    description: 'Transport',
  },
  'Commercial, Transport,': {
    code: 'CT11',
    value: 'commercial.transport.infrastructure',
    description: 'Transport Related Infrastructure',
  },
  'Commercial, Transport, Bus shelters': {
    code: 'CT02',
    value: 'commercial.transport.bus',
    description: 'Bus Shelter',
  },
  'Commercial, Transport, Bus Shelters': {
    code: 'CT02',
    value: 'commercial.transport.bus',
    description: 'Bus Shelter',
  },
  'Commercial, Transport, Car Parks and Park & Ride sites': {
    code: 'CT03',
    value: 'commercial.transport.parking',
    description:
      'Car / Coach / Commercial Vehicle / Taxi Parking / Park And Ride Site',
  },
  'Commercial, Transport, Moorings': {
    code: 'CT06',
    value: 'commercial.transport.mooring',
    description: 'Mooring',
  },
  'Commercial, Transport, Railway assets': {
    code: 'CT07',
    value: 'commercial.transport.railAsset',
    description: 'Railway Asset',
  },
  'Commercial, Transport, Railway Assets': {
    code: 'CT07',
    value: 'commercial.transport.railAsset',
    description: 'Railway Asset',
  },
  'Commercial, Transport, Stations and Interchanges': {
    code: 'CT08',
    value: 'commercial.transport.terminal',
    description: 'Station / Interchange / Terminal / Halt',
  },
  'Commercial, Transport, Transport Related Infrastructure': {
    code: 'CT11',
    value: 'commercial.transport.infrastructure',
    description: 'Transport Related Infrastructure',
  },
  'Commercial, Utilities': {
    code: 'CU',
    value: 'commercial.utility',
    description: 'Utility',
  },
  'Commercial, Utilities, Electricity Sub-stations': {
    code: 'CU01',
    value: 'commercial.utility.SubStation',
    description: 'Electricity Sub-Station',
  },
  'Commercial, Utilities, Gas and Oil Storage/ Distribution': {
    code: 'CU08',
    value: 'commercial.utility.oilGas',
    description: 'Gas / Oil Storage / Distribution',
  },
  'Commercial, Utilities, Other utility use': {
    code: 'CU09',
    value: 'commercial.utility.other',
    description: 'Other Utility Use',
  },
  'Commercial, Utilities, Pumping Stations/Water Towers': {
    code: 'CU04',
    value: 'commercial.utility.water',
    description: 'Pump House / Pumping Station / Water Tower',
  },
  'Commercial, Utilities, Telecommunications': {
    code: 'CU06',
    value: 'commercial.utility.telecoms',
    description: 'Telecommunication',
  },
  'Commercial, Utilities, Telephone boxes': {
    code: 'CU11',
    value: 'commercial.utility.publicPhone.box',
    description: 'Telephone Box',
  },
  'Dual Use': { code: 'X', value: 'dualUse', description: 'Dual Use' },
  'Features, Monuments': {
    code: 'ZM',
    value: 'object.monument',
    description: 'Monument',
  },
  'Features, Monuments, Obelisks/Milestones/Standing Stones': {
    code: 'ZM01',
    value: 'object.monument.vertical',
    description: 'Obelisk / Milestone / Standing Stone',
  },
  'Features, Monuments, Statues': {
    code: 'ZM03',
    value: 'object.monument.statue',
    description: 'Statue',
  },
  'Features, Places of Worship': {
    code: 'ZW',
    value: 'object.religious',
    description: 'Place Of Worship',
  },
  'Features, Places of Worship Churches, mosques, synagogues, chapels': {
    code: 'ZW',
    value: 'object.religious',
    description: 'Place Of Worship',
  },
  'Objects of Interest': {
    code: 'Z',
    value: 'object',
    description: 'Object of Interest',
  },
  'Objects of Interest,': {
    code: 'ZW',
    value: 'object.religious',
    description: 'Place Of Worship',
  },
  'Objects of Interest, Monuments': {
    code: 'ZM',
    value: 'object.monument',
    description: 'Monument',
  },
  'Objects of Interest, Monuments,': {
    code: 'ZM05',
    value: 'object.monument.other',
    description: 'Other Structure',
  },
  'Objects of Interest, Monuments, Memorials and Market Crosses': {
    code: 'ZM02',
    value: 'object.monument.memorial',
    description: 'Memorial / Market Cross',
  },
  'Objects of Interest, Monuments, Obelisks/Milestones/Standing Stones': {
    code: 'ZM01',
    value: 'object.monument.vertical',
    description: 'Obelisk / Milestone / Standing Stone',
  },
  'Objects of Interest, Monuments, Other Structures': {
    code: 'ZM05',
    value: 'object.monument.other',
    description: 'Other Structure',
  },
  'Objects of Interest, Monuments, Statues': {
    code: 'ZM03',
    value: 'object.monument.statue',
    description: 'Statue',
  },
  'Objects of Interest, Other': {
    code: 'ZV',
    value: 'object.underground.other',
    description: 'Other Underground Feature',
  },
  'Objects of Interest, Places of Worship': {
    code: 'ZW',
    value: 'object.religious',
    description: 'Place Of Worship',
  },
  'Parent Shell': { code: 'P', value: 'parent', description: 'Parent Shell' },
  'Parent Shell,': {
    code: 'PP',
    value: 'parent.property',
    description: 'Property Shell',
  },
  'Parent Shell, Property Shell': {
    code: 'RD04',
    value: 'residential.dwelling.house.terrace',
    description: 'Terrace',
  },
  'Parent Shell, Street Record': {
    code: 'PS',
    value: 'parent.street',
    description: 'Street Record',
  },
  Residential: {
    code: 'RD04',
    value: 'residential.dwelling.house.terrace',
    description: 'Terrace',
  },
  'Residential,': {
    code: 'RD',
    value: 'residential.dwelling',
    description: 'Residential dwelling',
  },
  'Residential, Dwellings': {
    code: 'RD04',
    value: 'residential.dwelling.house.terrace',
    description: 'Terrace',
  },
  'Residential, Dwellings,': {
    code: 'RD04',
    value: 'residential.dwelling.house.terrace',
    description: 'Terrace',
  },
  'Residential, Dwellings, Detached': {
    code: 'RD02',
    value: 'residential.dwelling.house.detached',
    description: 'Detached',
  },
  'Residential, Dwellings, Flat': {
    code: 'RD06',
    value: 'residential.dwelling.flat',
    description: 'Flat',
  },
  'Residential, Dwellings, House Boats': {
    code: 'RD07',
    value: 'residential.dwelling.boat',
    description: 'House Boat',
  },
  'Residential, Dwellings, Semi-Detached': {
    code: 'RD03',
    value: 'residential.dwelling.house.semiDetached',
    description: 'Semi-detached',
  },
  'Residential, Dwellings, Sheltered Accommodation': {
    code: 'RD08',
    value: 'residential.dwelling.shelteredAccommodation',
    description: 'Sheltered Accommodation',
  },
  'Residential, Dwellings, Terraced': {
    code: 'RD04',
    value: 'residential.dwelling.house.terrace',
    description: 'Terrace',
  },
  'Residential, Garages': {
    code: 'RG',
    value: 'residential.garage',
    description: 'Garage',
  },
  'Residential, Garages,': {
    code: 'RG02',
    value: 'residential.garage',
    description: 'Lock-Up Garage / Garage Court',
  },
  'Residential, Garages, Lock-up garages and garage courts': {
    code: 'RG02',
    value: 'residential.garage',
    description: 'Lock-Up Garage / Garage Court',
  },
  'Residential, Garages, Lock-Up Garages and Garage Courts': {
    code: 'RG02',
    value: 'residential.garage',
    description: 'Lock-Up Garage / Garage Court',
  },
  'Residential, , HMO Bedsit': {
    code: 'RH02',
    value: 'residential.HMO.bedsit',
    description: 'HMO Bedsit / Other Non Self Contained Accommodation',
  },
  'Residential, Houses in Multiple Occupation': {
    code: 'RH',
    value: 'residential.HMO',
    description: 'House In Multiple Occupation',
  },
  'Residential, Houses in Multiple Occupation,': {
    code: 'RH02',
    value: 'residential.HMO.bedsit',
    description: 'HMO Bedsit / Other Non Self Contained Accommodation',
  },
  'Residential, Houses in Multiple Occupation, HMO Bedsit': {
    code: 'RH02',
    value: 'residential.HMO.bedsit',
    description: 'HMO Bedsit / Other Non Self Contained Accommodation',
  },
  'Residential, Houses in Multiple Occupation, HMO not further divided': {
    code: 'RH03',
    value: 'residential.HMO.undivided',
    description: 'HMO Not Further Divided',
  },
  'Residential, Houses in Multiple Occupation, HMO Parent': {
    code: 'RD04',
    value: 'residential.dwelling.house.terrace',
    description: 'Terrace',
  },
  'Residential, Residential Institutions': {
    code: 'RI',
    value: 'residential.institution',
    description: 'Residential Institution',
  },
  'Residential, Residential Institutions,': {
    code: 'RI01',
    value: 'residential.institution.care',
    description: 'Care / Nursing Home',
  },
  'Residential, Residential Institutions, Care/ Nursing Homes': {
    code: 'RI01',
    value: 'residential.institution.care',
    description: 'Care / Nursing Home',
  },
  'Residential, Residential Institutions, Communal residences': {
    code: 'RI02',
    value: 'residential.institution.communal',
    description: 'Communal Residence',
  },
  'Residential, Residential Institutions, Communal Residences': {
    code: 'RI02',
    value: 'residential.institution.communal',
    description: 'Communal Residence',
  },
  'Residential, Residential Institutions, Residential education (e.g. halls of residence)': {
    code: 'RI03',
    value: 'residential.institution.education',
    description: 'Residential Education',
  },
  'Residential, Residential Institutions, Residential Education e.g. Halls of Residence': {
    code: 'RI03',
    value: 'residential.institution.education',
    description: 'Residential Education',
  },
  Unclassified: {
    code: 'U',
    value: 'unclassified',
    description: 'Unclassified',
  },
  'Unclassified, Awaiting Classification': {
    code: 'UC',
    value: 'unclassified.awaitingclassification',
    description: 'Awaiting Classification',
  },
  'Unclassified, Pending Internal Investigation': {
    code: 'UP',
    value: 'unclassified.pendingInvestigation',
    description: 'Pending Internal Investigation',
  },
}

export async function search(
  request: Request,
  response: Response,
  next: NextFunction
) {
  // const postcode = await formatPostcode(request.params.postcode)

  try {
    const { data: pdata } = await axios.get(
      `https://api.postcodes.io/postcodes/${request.params.postcode}`
    )

    const postcode = pdata.result.postcode

    const localAuthority = pdata.result.admin_district.toLowerCase()

    if (localAuthority === 'canterbury') {
      const tokenData = await axios({
        method: 'post',
        url: 'https://mapping.canterbury.gov.uk/arcgis/tokens/generateToken',
        data: `username=${encodeURIComponent(
          process.env.CANTERBURY_USERNAME
        )}&password=${encodeURIComponent(process.env.CANTERBURY_PASSWORD)}`,
      })
      const token = tokenData.data

      let url = `https://mapping.canterbury.gov.uk/arcgis/rest/services/PlanX/LLPG_Point_Data/MapServer/find`

      const params = {
        token,
        searchText: postcode,
        searchFields: 'POSTCODE',
        layers: 'LLPG_Point_Data',
        f: 'pjson',
      }
      url = [
        url,
        Object.keys(params)
          .map(key => `${key}=${escape(params[key])}`)
          .join('&'),
      ].join('?')

      console.log(process.env.CANTERBURY_USERNAME, url)

      const { data } = await axios.get(url)

      console.log(data)

      const output = {
        localAuthority: 'canterbury',
        results: data.results.map(result => {
          const { x: longitude, y: latitude } = proj4.transform(
            projections.ordnanceSurvey,
            projections.standard,
            [result.geometry.x, result.geometry.y]
          )

          let code = {
            blpu_code: 'RD06',
            planx_description: 'Flat',
            planx_value: 'residential.dwelling.flat',
          }

          if (
            result.attributes.CLASS_DESC &&
            CODES[result.attributes.CLASS_DESC]
          ) {
            code = {
              blpu_code: CODES[result.attributes.CLASS_DESC].code,
              planx_description:
                CODES[result.attributes.CLASS_DESC].description,
              planx_value: CODES[result.attributes.CLASS_DESC].value,
            }
          }

          return {
            id: result.attributes.UPRN.toString(),
            name:
              result.attributes.FULL_ADDRESS.split(',').length > 3
                ? result.attributes.FULL_ADDRESS.split(',')
                    .slice(0, -3)
                    .join(',')
                : result.attributes.FULL_ADDRESS,
            uprn: result.attributes.UPRN,
            updrn: result.attributes.UPRN,
            x: result.geometry.x,
            y: result.geometry.y,
            lat: latitude,
            lng: longitude,
            rawData: {
              UPRN: Number(result.attributes.UPRN),
              team: 'canterbury',
              organisation: result.attributes.ORGANISATION,
              sao: result.attributes.SAO_DESC,
              pao: result.attributes.PAO_DESC,
              street: result.attributes.STREET_NAME,
              town: result.attributes.TOWN_NAME,
              postcode: result.attributes.POSTCODE,
              ...code,
              x: result.geometry.x,
              y: result.geometry.y,
            },
          }
        }),
      }
      return response.json(output)
    }

    if (!['southwark', 'wycombe', 'lambeth'].includes(localAuthority)) {
      return response.json({
        localAuthority,
        results: [],
      })
    }

    const url = `https://llpg.planx.uk/addresses?limit=100&postcode=eq.${postcode}`
    console.log({ url })

    const { data } = await axios.get(url)

    const results0 = data.map(result => {
      const { x: longitude, y: latitude } = proj4.transform(
        projections.ordnanceSurvey,
        projections.standard,
        [Number(result.x), Number(result.y)]
      )

      return {
        id: result.UPRN.toString(),
        name: [
          result.organisation,
          result.sao,
          [result.pao, result.street].filter(Boolean).join(' '),
        ]
          .filter(Boolean)
          .join(', '),
        uprn: result.UPRN.toString(),
        updrn: result.UPRN.toString(),
        x: Number(result.x),
        y: Number(result.y),
        lat: latitude,
        lng: longitude,
        rawData: result,
      }
    })

    const results1 = groupBy(results0, r => {
      return [r.rawData.pao, r.rawData.street].filter(Boolean).join(' ')
    })

    const results = []

    Object.keys(results1)
      .sort(naturalSort)
      .forEach(k => {
        Object.values(results1[k])
          .sort((a: any, b: any) => {
            return naturalSort(a.rawData.sao, b.rawData.sao)
          })
          .forEach(sorted => results.push(sorted))
      })

    response.json({
      localAuthority,
      results,
    })
  } catch (e) {
    next(e)
  }
}
