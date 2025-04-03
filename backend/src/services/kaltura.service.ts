/**
 * Kaltura API integration service
 * Handles communication with the Kaltura API for KS generation
 */
import axios from 'axios';
import config from '../config';

/**
 * Interface for the Kaltura session.start API response
 * The API might return the KS token directly as a string or in a result property
 */
interface KalturaSessionStartResponse {
  result?: string;
  executionTime?: number;
}

/**
 * Interface for the Kaltura session generation options
 */
interface KsGenerationOptions {
  entryId?: string;
  additionalPrivileges?: string[];
}

/**
 * Service for interacting with the Kaltura API
 */
export class KalturaService {
  private apiEndpoint: string;
  private partnerId: number;
  private adminSecret: string;
  private defaultPrivileges: string[];
  private ksExpirySeconds: number;

  /**
   * Creates a new instance of the KalturaService
   */
  constructor() {
    this.apiEndpoint = config.kaltura.apiEndpoint;
    this.partnerId = config.kaltura.partnerId;
    this.adminSecret = config.kaltura.adminSecret;
    this.defaultPrivileges = config.kaltura.defaultPrivileges;
    this.ksExpirySeconds = config.kaltura.ksExpirySeconds;
  }

  /**
   * Generates a Kaltura Session (KS) token
   * @param options - Options for KS generation
   * @returns The generated KS token
   */
  async generateKs(options: KsGenerationOptions = {}): Promise<string> {
    try {
      // Validate configuration
      this.validateConfig();
      
      // Prepare privileges string
      const privileges = this.buildPrivilegesString(options);

      console.log(`Generating KS with partnerId: ${this.partnerId}, privileges: ${privileges}`);

      // Call the Kaltura session.start API
      const response = await axios.get<KalturaSessionStartResponse>(
        `${this.apiEndpoint}/session/action/start`,
        {
          params: {
            format: 1, // JSON format
            partnerId: this.partnerId,
            secret: this.adminSecret,
            type: 0, // USER session type
            expiry: this.ksExpirySeconds,
            privileges
          }
        }
      );

      // Check if we have a response
      if (!response.data) {
        console.error('Empty response from Kaltura API');
        throw new Error('Empty response from Kaltura API');
      }

      // The API might return the KS token directly as a string or in a result property
      let ksToken: string | undefined;
      
      if (typeof response.data === 'string') {
        // API returned the KS token directly as a string
        ksToken = response.data;
        console.log('Received KS token directly as string');
      } else if (response.data && typeof response.data === 'object') {
        if (response.data.result !== undefined) {
          // API returned the KS token in the result property
          ksToken = response.data.result;
          console.log('Received KS token in result property');
        } else {
          // Try to use the entire response as the token if it's a non-empty string when stringified
          const stringifiedData = JSON.stringify(response.data);
          if (stringifiedData && stringifiedData !== '{}' && stringifiedData !== '[]') {
            ksToken = stringifiedData;
            console.log('Using stringified response data as KS token');
          }
        }
      }
      
      // Clean and validate the KS token
      if (!ksToken) {
        console.error('No valid KS token found in response:', response.data);
        throw new Error('No valid KS token found in Kaltura API response');
      }
      
      const ks = this.cleanKs(ksToken);
      
      if (!ks) {
        throw new Error('Empty KS returned from Kaltura API');
      }
      
      return ks;
    } catch (error) {
      console.error('Error generating Kaltura Session:', error);
      throw new Error('Failed to generate Kaltura Session token');
    }
  }
  
  /**
   * Validates that all required configuration is present
   * @throws Error if any required configuration is missing
   */
  private validateConfig(): void {
    if (!this.apiEndpoint) {
      throw new Error('Kaltura API endpoint is not configured');
    }
    
    if (!this.partnerId) {
      throw new Error('Kaltura Partner ID is not configured');
    }
    
    if (!this.adminSecret) {
      throw new Error('Kaltura Admin Secret is not configured');
    }
  }

  /**
   * Builds the privileges string for the KS
   * @param options - Options containing entryId and additional privileges
   * @returns The combined privileges string
   */
  private buildPrivilegesString(options: KsGenerationOptions): string {
    const privileges = [...this.defaultPrivileges];

    // Override entry ID if provided
    if (options.entryId) {
      // Replace the default sview and eventsessioncontextid with the provided entryId
      const entryIdPrivileges = [
        `sview:${options.entryId}`,
        `eventsessioncontextid:${options.entryId}`
      ];

      // Filter out the default privileges that we're replacing
      const filteredPrivileges = privileges.filter(
        p => !p.startsWith('sview:') && !p.startsWith('eventsessioncontextid:')
      );

      // Combine the filtered privileges with the new entryId privileges
      return [...filteredPrivileges, ...entryIdPrivileges, ...(options.additionalPrivileges || [])].join(',');
    }

    // Use default privileges if no entryId is provided
    return [...privileges, ...(options.additionalPrivileges || [])].join(',');
  }

  /**
   * Cleans the KS token by removing any double quotes and extra whitespace
   * @param ks - The raw KS token from the API
   * @returns The cleaned KS token
   */
  private cleanKs(ks: string | undefined): string {
    // Check if ks is defined before processing
    if (!ks) {
      console.error('Received undefined or empty KS from Kaltura API');
      return '';
    }
    
    // Remove double quotes and trim whitespace
    let cleaned = ks.replace(/"/g, '').trim();
    
    // If the token is wrapped in quotes (common in JSON responses), remove them
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    
    return cleaned;
  }
}

// Export a singleton instance of the service
export const kalturaService = new KalturaService();