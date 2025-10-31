import { Controller, Get, Query } from '@nestjs/common';
import axios from 'axios';

@Controller('api')
export class CountriesController {
  private countriesCache: string[] = [];
  private statesCache: Record<string, string[]> = {};
  private citiesCache: Record<string, string[]> = {};

  async onModuleInit() {
    await this.getCountries(); // Preload countries once
  }
  
  @Get('countries')
  async getCountries() {
    if (this.countriesCache.length > 0) {
      console.log('[CACHE] Returning countries from memory');
      return this.countriesCache;
    }

    const { data } = await axios.get('https://countriesnow.space/api/v0.1/countries');
    this.countriesCache = data.data.map((c: any) => c.country);
    return this.countriesCache;
  }

  @Get('states')
  async getStates(@Query('country') country: string) {
    if (this.statesCache[country]) {
      console.log(`[CACHE] Returning states for ${country}`);
      return this.statesCache[country];
    }

    const { data } = await axios.post(
      'https://countriesnow.space/api/v0.1/countries/states',
      { country },
    );
    this.statesCache[country] = data.data.states.map((s: any) => s.name);
    return this.statesCache[country];
  }

  
  @Get('cities')
  async getCities(@Query('country') country: string) {
    if (this.citiesCache[country]) {
      console.log(`[CACHE] Returning cities for ${country}`);
      return this.citiesCache[country];
    }

    const { data } = await axios.post(
      'https://countriesnow.space/api/v0.1/countries/cities',
      { country },
    );
    this.citiesCache[country] = data.data;
    return this.citiesCache[country];
  }
}
