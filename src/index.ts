import { AnimeInfoInterface } from './anime-info.interface';

export default class Zettai {
    private animeInfo: AnimeInfoInterface = {};
    private replaced1?: string;
    private replaced2?: string;

    constructor(
        private workingTitle: string,
    ) {
    }

    // Static export function for parsing titles
    static parseAnime(animeTitle: string) {
        return new Zettai(animeTitle).parse();
    }

    // Parse method
    public parse(): AnimeInfoInterface {
        this.workingTitle = this.workingTitle.trim();

        // Parse file extension
        const extensionRegex = /\.[0-9a-z]+$/i;
        const fileExtention = this.workingTitle.match(extensionRegex);

        if (fileExtention != null) {
            this.animeInfo.extension = fileExtention.toString();
            this.replaceWorkingTitle(extensionRegex, '');
        }

        // Normalize whitespaces
        this.replaceWorkingTitle(/_|,|(\.)(?!\d+)/g, ' ');

        /**
         * THORA likes to put their handle
         * at the end of the file without enclosing
         */
        if (/THORA/i.test(this.workingTitle)) {
            this.animeInfo.releaseGroup = 'THORA';
            this.replaceWorkingTitle(/THORA/ig, '');
        }

        // Parse all fields
        this.getSeason();
        this.getEpisodeNumber();
        this.getVersion();
        this.getResolution();
        this.getVideoTerm();
        this.getAudioTerm();
        this.getChecksum();
        this.getLanguage();
        this.getSource();
        this.getSubtitles();
        this.getOtherInfo();
        this.getVolume();

        this.getYear();
        this.getDeviceCompat();
        this.getReleaseInfo();
        this.getAnimeType();
        this.prepareForRelease();
        this.getEpisodeTitle();
        this.removeEpisodeInfo();
        this.cleanUp();
        this.getReleaseGroup();
        this.prepareForTitle();

        return this.animeInfo;
    }


    // Parse Season
    private getSeason() {
        const seasonRegex = /(SEASON|SAISON)\s*([^a-zA-Z\d\(\[\{\)\]\}]*)\s*([0]+[0-9]*|[1-9][0-9]*)([^a-zA-Z\d\(\[\{\)\]\}]*)/ig;
        const foundSeason = this.workingTitle.match(seasonRegex);

        const regTmp = [
            '\\s*([^a-zA-Z\\d\\(\\[\\{\\)\\]\\}]*)\\s*(SEASON|SAISON)([^a-zA-Z\\d\\(\\[\\{\\)\\]\\}]*)|',
            '\\s*([^a-zA-Z\\d\\(\\[\\{\\)\\]\\}]*)\\s*(SEASON|SAISON)([^a-zA-Z\\d\\(\\[\\{\\)\\]\\}]*)',
        ];
        const res = [
            ['1st', 'FIRST'],
            ['2nd', 'SECOND'],
            ['3rd', 'THIRD'],
            ['4th', 'FOURTH'],
            ['5th', 'FIFTH'],
            ['6th', 'SIXTH'],
            ['7th', 'SEVENTH'],
            ['8th', 'EIGHTH'],
            ['9th', 'NINTH'],
        ].some((e, i) => {
            const reg = new RegExp(e[0] + regTmp[0] + e[1] + regTmp[1], 'i');
            if (reg.test(this.workingTitle)) {
                this.animeInfo.season = 'Season ' + (i + 1);
                this.replaceWorkingTitle(reg, '');
                return true;
            }
        });

        if (!res && foundSeason !== null) {
            this.animeInfo.season = foundSeason.toString().replace(/([^a-zA-Z\d\s,]*)/g, '').trim();
            this.replaceWorkingTitle(seasonRegex, ' ');
        }
    }

    // Parse Episode Number
    private getEpisodeNumber() {
        const episodeNumberRegex = /(EPISODE\.|EPISODES|EPISODE|EPS\.|EPS|EP\.|EP|CAPITULO|EPISODIO|FOLGE)\s*([^a-zA-Z\d\(\[\{\)\]\}\.]*)\d+-\d+(?![^a-zA-Z\d\s\[\]\(\)\{\}\-\,])|(EPISODE\.|EPISODES|EPISODE|EPS\.|EPS|EP\.|EP|CAPITULO|EPISODIO|FOLGE)\s*([^a-zA-Z\d\(\[\{\)\]\}\.]*)\s*(\d+\.\d{1})(?!\d+)([^a-zA-Z\d\(\[\{\)\]\}\-\,]*)|(EPISODE\.|EPISODES|EPISODE|EPS\.|EPS|EP\.|EP|CAPITULO|EPISODIO|FOLGE)\s*([^a-zA-Z\d\(\[\{\)\]\}\.]*)\s*([0]+[0-9]*|[1-9][0-9]*)/ig;
        const foundEpisodeNumber = this.workingTitle.match(episodeNumberRegex);

        if (foundEpisodeNumber != null) {
            this.animeInfo.episodeOrMovieNumber = foundEpisodeNumber.toString().replace(/([^a-zA-Z\d]*)(EPISODE\.|EPISODES|EPISODE|EPS\.|EPS|EP\.|EP|CAPITULO|EPISODIO|FOLGE)([^a-zA-Z\d\.]*)|([^a-zA-Z\d\.\-]*)/ig, '');
            //this.replaceWorkingTitle(episodeNumberRegex, "");
        }
    }

    // Parse Version
    private getVersion() {
        const versionRegex = /(V0|V1|V2|V3|V4)([^a-zA-Z\d\(\[\{\)\]\}]*)/ig;
        const foundVersion = this.workingTitle.match(versionRegex);

        if (foundVersion != null) {
            this.animeInfo.version = foundVersion.toString().replace(/([^a-zA-Z\d,]*)/g, '');
            this.replaceWorkingTitle(versionRegex, ' ');
        }
    }

    // Parse Resolution
    private getResolution() {
        const resolutionRegex = /(\b(\d+)x(\d+)\b)([^a-zA-Z\d\(\[\{\)\]\}]*)/i;
        const foundResolution = this.workingTitle.match(resolutionRegex);

        /* Need to augment checks for fansub groups that do not include the "p" in the resolution */
        const res = ['480p', '720p', '1080p'].some(res => {
            const regExp = new RegExp(res, 'i');
            if (regExp.test(this.workingTitle)) {
                this.animeInfo.resolution = res;
                this.replaceWorkingTitle(regExp, '');
                return true;
            }
        });

        if (!res && foundResolution !== null) {
            this.animeInfo.resolution = foundResolution[0].toString().replace(/([^a-zA-Z\d]*)/g, '');
            this.replaceWorkingTitle(resolutionRegex, ' ');
        }
    }

    // Parse Video Term
    private getVideoTerm() {
        const videoTermRegex = /(\b23\.976FPS\b|\b29\.97FPS\b|\bH\.264\b|\bH\.265\b|\bX\.264\b|\b24FPS\b|\b30FPS\b|\b60FPS\b|\b120FPS\b|\b8BIT\b|\b8-BIT\b|\b10BIT\b|\b10BITS\b|\b10-BIT\b|\b10-BITS\b|\bHI10\b|\bHI10P\b|\bHI444\b|\bHI444P\b|\bHI444PP\b|\bH264\b|\bH265\b|\bX264\b|\bX265\b|\bAVC\b|\bHEVC\b|\bHEVC2\b|\bDIVX\b|\bDIVX5\b|\bDIVX6\b|\bXVID\b|\bAVI\b|\bRMVB\b|\bWMV\b|\bWMV3\b|\bWMV9\b|\bHQ\b|\bLQ\b|\bHD\b|\bSD\b)([^a-zA-Z\d\(\[\{\)\]\}]*)/ig;
        const foundVideo = this.workingTitle.match(videoTermRegex);
        if (foundVideo != null) {
            this.animeInfo.videoTerm = foundVideo.toString().replace(/([^a-zA-Z\d,]*)/g, '');
            this.replaceWorkingTitle(videoTermRegex, ' ');
        }
    }

    // Parse Audio Term
    private getAudioTerm() {
        const audioTermRegex = /(\b2(\s*-\s*)?CH\b|\bDTS-ES\b|\bDTS\b|\bAAC\b|\bAAC(\s*-\s*)?X2\b|\bAAC(\s*-\s*)?X3\b|\bAAC(\s*-\s*)?X4\b|\bAC(\s*-\s*)?3\b|\bEAC(\s*-\s*)?3\b|\bE-AC-3\b|\bFLAC(\s*-\s*)?X2\b|\bFLAC(\s*-\s*)?X3\b|\bFLAC(\s*-\s*)?X4\b|\bFLAC\b|\bLOSSLESS\b|\bMP3\b|\bOGG\b|\bVORBIS\b|(\bDUAL\s*([^a-zA-Z\d]*)\s*AUDIO\b)|\bDUALAUDIO\b|\b2\.0CH\b|\b5\.1\b|\b5\.1CH\b|\bDTS5\.1\b|\bTRUEHD5\.1\b)([^a-zA-Z\d\(\[\{\)\]\}]*)/ig;
        const foundAudio = this.workingTitle.match(audioTermRegex);
        if (foundAudio != null) {
            this.animeInfo.audioTerm = foundAudio.toString().replace(/([^a-zA-Z\d,]*)/g, '');
            this.replaceWorkingTitle(audioTermRegex, ' ');
        }
    }

    // Parse Checksum
    private getChecksum() {
        const checksumRegex = /(\b[0-9A-Fa-f]{8}\b)([^a-zA-Z\d\(\[\{\)\]\}]*)/i;
        const foundChecksum = this.workingTitle.match(checksumRegex);
        if (foundChecksum != null) {
            this.animeInfo.checksum = foundChecksum[0].toString().replace(/([^a-zA-Z\d]*)/g, '');
            this.replaceWorkingTitle(checksumRegex, ' ');
        }
    }

    // Parse Language
    private getLanguage() {
        const languageRegex = /(\bENG\b|\bENGLISH\b|\bESPANOL\b|\bJAP\b|\bPT-BR\b|\bSPANISH\b|\bVOSTFR\b|\bFR\b|\bJPN\b)([^a-zA-Z\d\(\[\{\)\]\}]*)/ig;
        const foundLanguage = this.workingTitle.match(languageRegex);
        
        if (foundLanguage != null) {
            this.animeInfo.language = foundLanguage.toString().replace(/([^a-zA-Z\d,]*)/g, '');
            this.replaceWorkingTitle(languageRegex, ' ');
        }
    }

    // Parse Source
    private getSource() {
        const sourceRegex = /(\bBD\b|\bBDRIP\b|\bBLURAY\b|\bBLU-RAY\b|\bDVD\b|\bDVD5\b|\bDVD9\b|\bDVD-R2J\b|\bDVDRIP\b|\bDVD-RIP\b|\bR2DVD\b|\bR2J\b|\bR2JDVD\b|\bR2JDVDRIP\b|\bHDTV\b|\bHDTVRIP\b|\bTVRIP\b|\bTV-RIP\b|\bWEBCAST\b|\bWEBRIP\b)([^a-zA-Z\d\(\[\{\)\]\}]*)/ig;
        const foundSource = this.workingTitle.match(sourceRegex);

        if (foundSource != null) {
            this.animeInfo.source = foundSource.toString().replace(/([^a-zA-Z\d,]*)/g, '');
            this.replaceWorkingTitle(sourceRegex, ' ');
        }
    }
    
    // Parse Subtitles
    private getSubtitles() {
        const subtitleRegex = /(\bASS\b|\bBIG5\b|\bDUB\b|\bDUBBED\b|\bHARDSUB\b|\bHARDSUBS\b|\bRAW\b|\bSOFTSUB\b|\bSOFTSUBS\b|\bSUB\b|\bSUBBED\b|\bSUBTITLED\b)([^a-zA-Z\d\(\[\{\)\]\}]*)/i;
        const foundSubtitle = this.workingTitle.match(subtitleRegex);

        if (foundSubtitle != null) {
            this.animeInfo.subtitles = foundSubtitle[0].toString().replace(/([^a-zA-Z\d]*)/g, '');
            this.replaceWorkingTitle(subtitleRegex, ' ');
        }
    }

    // Parse Other Info
    private getOtherInfo() {
        const otherRegex = /(\bREMASTER\b|\bREMASTERED\b|\bUNCENSORED\b|\bUNCUT\b|\bTS\b|\bVFR\b|\bWIDESCREEN\b|\bWS\b)([^a-zA-Z\d\(\[\{\)\]\}]*)/ig;
        const foundOther = this.workingTitle.match(otherRegex);

        if (foundOther != null) {
            this.animeInfo.otherInfo = foundOther.toString().replace(/([^a-zA-Z\d,]*)/g, '');
            this.replaceWorkingTitle(otherRegex, ' ');
        }
    }

    // Parse Volume
    private getVolume() {
        const volumeRegex = /(VOL|VOL\.|VOLUME|VOLUME\.)\s*([^a-zA-Z\d\(\[\{\)\]\}]*)\s*([0]+[0-9]*|[1-9][0-9]*)([^a-zA-Z\d\(\[\{\)\]\}]*)/ig;
        const foundVolume = this.workingTitle.match(volumeRegex);

        if (foundVolume != null) {
            this.animeInfo.volume = foundVolume.toString().replace(/([^a-zA-Z\d,]*)/g, '');
            this.replaceWorkingTitle(volumeRegex, ' ');
        }
    }

    // Parse Year
    private getYear() {
        /**
         * We cannot check for year without it being
         * enclosed because of Anime with year-type
         * integers in their title.
         */
        const yearRegex = /\(([^a-zA-Z\d\(\[\{\)\]\}]*)(\b(19[0-9]\d|20[0-4]\d|2050)\b)([^a-zA-Z\d\(\[\{\)\]\}]*)\)|\[([^a-zA-Z\d\(\[\{\)\]\}]*)(\b(19[0-9]\d|20[0-4]\d|2050)\b)([^a-zA-Z\d\(\[\{\)\]\}]*)\]|\{([^a-zA-Z\d\(\[\{\)\]\}]*)(\b(19[0-9]\d|20[0-4]\d|2050)\b)([^a-zA-Z\d\(\[\{\)\]\}]*)\}/;
        const foundYear = this.workingTitle.match(yearRegex);
        if (foundYear != null) {
            this.animeInfo.year = foundYear[0].toString().replace(/([^a-zA-Z\d]*)/g, '');
            this.replaceWorkingTitle(yearRegex, ' ');
        }
    }

    // Parse Device Compat
    private getDeviceCompat() {
        /**
         * We cannot check for ANDROID without it being enclosed
         * because of anime titles such as "Android Ana Maico."
         */
        const deviceCompatRegex = /(\bIPAD\s*([^a-zA-Z\d\(\[\{\)\]\}]*)\s*3\b|\bIPHONE\s*([^a-zA-Z\d\(\[\{\)\]\}]*)\s*5\b|\bIPOD\b|\bPS\s*([^a-zA-Z\d\(\[\{\)\]\}]*)\s*3\b|\bXBOX\b|\bXBOX\s*([^a-zA-Z\d\(\[\{\)\]\}]*)\s*360\b|\[\s*ANDROID\s*\]|\(\s*ANDROID\s*\)|\{\s*ANDROID\s*\})([^a-zA-Z\d\(\[\{\)\]\}]*)/ig;
        const foundDeviceCompat = this.workingTitle.match(deviceCompatRegex);

        if (foundDeviceCompat != null) {
            this.animeInfo.deviceCompatibility = foundDeviceCompat.toString().replace(/([^a-zA-Z\d,]*)/g, '');
            this.replaceWorkingTitle(deviceCompatRegex, ' ');
        }
    }

    // Parse Release Info
    private getReleaseInfo() {
        /**
         * We cannot check for END & FINAL without it being enclosed
         * because of anime titles such as "Final Approach."
         */
        const releaseInfoRegex = /(\bBATCH([^a-zA-Z\d\(\[\{\)\]\}]*)(VERSION|EDITION|RELEASE)?\b|\bCOMPLETE([^a-zA-Z\d\(\[\{\)\]\}]*)(VERSION|EDITION|RELEASE)?\b|\bPATCH([^a-zA-Z\d\(\[\{\)\]\}]*)(VERSION|EDITION|RELEASE)?\b|\bREMUX([^a-zA-Z\d\(\[\{\)\]\}]*)(VERSION|EDITION|RELEASE)?\b|\(\s*END\s*\)|\(\s*FINAL\s*\)|\[\s*END\s*\]|\[\s*FINAL\s*\]|\{\s*END\s*\}|\{\s*FINAL\s*\})([^a-zA-Z\d\(\[\{\)\]\}]*)/ig;
        const foundRelease = this.workingTitle.match(releaseInfoRegex);

        if (foundRelease != null) {
            this.animeInfo.releaseInfo = foundRelease.toString().replace(/([^a-zA-Z\d\s,]*)/g, '').trim();
            this.replaceWorkingTitle(releaseInfoRegex, ' ');
        }
    }

    // Parse Anime Type
    private getAnimeType() {
        const animeTypeRegex = /(\[|\(|\{)\s*(TV|SP|ED|ENDING|NCED|NCOP|OP|OPENING)\s*(\]|\)|\})([^a-zA-Z\d\(\[\{\)\]\}]*)/ig;
        const animeTypeSecondRegex = /(\bPREVIEW\b|\bPV\b|\bOVA\b|\bONA\b|\bOAD\b|\bOAV\b|SPECIALS+$|SPECIAL+$|SPECIAL:|\bMOVIE\b|\bGEKIJOUBAN\b)([^a-zA-Z\d\(\[\{\)\]\}]*)/ig;
        const foundAnimeType = this.workingTitle.match(animeTypeRegex);
        const foundAnimeTypeSecond = this.workingTitle.match(animeTypeSecondRegex);

        if (foundAnimeType != null) {
            this.animeInfo.animeType1 = foundAnimeType.toString().replace(/([^a-zA-Z\d,]*)/g, '');
            this.replaceWorkingTitle(animeTypeRegex, ' ');

        }

        if (foundAnimeTypeSecond != null) {
            this.animeInfo.animeType2 = foundAnimeTypeSecond.toString().replace(/([^a-zA-Z\d,]*)/g, '');
            this.replaceWorkingTitle(animeTypeSecondRegex, ' ')
        }
    }

    // Prepare for Release
    private prepareForRelease() {
        const numberRegex = /\b\d+\d\b(?![^a-zA-Z\d\s\[\]\(\)\{\}\-\,])|\b\d+\.5\b(?![^a-zA-Z\d\s\[\]\(\)\{\}\-\,])|(?<![^a-zA-Z\d\s\[\]\(\)\{\}])\b\d+\b(?![^a-zA-Z\d\s\[\]\(\)\{\}\-\,])/g;
        const foundNumber = this.workingTitle.match(numberRegex);
        const numberRangeRegex = /(?<![^a-zA-Z\d\s\[\]\(\)\{\}#\+-])\b\d+-\d+\b(?![^a-zA-Z\d\s\[\]\(\)\{\}\-\,])/;
        const foundNumberRange = this.workingTitle.match(numberRangeRegex);

        /**
         * Remove empty enclosings to prepare for
         * getReleaseGroup()
         */
        const removeEmpty = /\[\s*\]|\(\s*\)|\{\s*\}/g;
        const performRemoval = this.workingTitle.match(removeEmpty);

        if (performRemoval != null) {
            this.replaceWorkingTitle(removeEmpty, '');
        }

        if (foundNumberRange != null && this.animeInfo.episodeOrMovieNumber == null) {
            this.animeInfo.episodeOrMovieNumber = foundNumberRange.toString();

        } else if (foundNumber != null && this.animeInfo.episodeOrMovieNumber == null) {
            //console.log(foundNumber);
            this.animeInfo.episodeOrMovieNumber = foundNumber[foundNumber.length - 1].toString();
            //this.replaceWorkingTitle(numberRegex, "");

        }
    }

    // Parse Episode Title
    private getEpisodeTitle() {
        const episodeTitleRegex = /((EPISODE\.|EPISODES|EPISODE|EPS\.|EPS|EP\.|EP|CAPITULO|EPISODIO|FOLGE)\s*([0]+[0-9]*|[1-9][0-9]*))(?:(?!(\[|\(|\{)).)*/i;
        const foundEpisodeTitle = this.workingTitle.match(episodeTitleRegex);
        const secondTitleRegex = new RegExp('(?<![^a-zA-Z\\d\\s\\.\\[\\]\\(\\)\\{\\}#\\+-])(-|#|\\+?)\\b' + this.animeInfo.episodeOrMovieNumber + '\\b(?![^a-zA-Z\\d\\s\\[\\]\\(\\)\\{\\}\\-\\,])(?:(?!(\\[|\\(|\\{)).)*');
        //const secondTitleRegex = /\b\d+\.5\b(?![^a-zA-Z\d\s\[\]\(\)\{\}])|(?<![^a-zA-Z\d\s\[\]\(\)\{\}])\b\d+\b(?![^a-zA-Z\d\s\[\]\(\)\{\}])(?:(?!(\[|\(|\{)).)*/;
        const foundSecondEpisodeTitle = this.workingTitle.match(secondTitleRegex);

        if (this.animeInfo.episodeOrMovieNumber != null) {
            if (foundEpisodeTitle != null) {
                const episodeTitle = foundEpisodeTitle[0].toString().replace(/(EPISODE\.|EPISODES|EPISODE|EPS\.|EPS|EP\.|EP|CAPITULO|EPISODIO|FOLGE)\s*([^a-zA-Z\d\(\[\{\)\]\}\.]*)\d+-\d+(?![^a-zA-Z\d\s\[\]\(\)\{\}\-\,])|(EPISODE\.|EPISODES|EPISODE|EPS\.|EPS|EP\.|EP|CAPITULO|EPISODIO|FOLGE)\s*(\d+\.\d{1})(?!\d+)|\[|\]|\(|\)|\{|\}|-|(EPISODE\.|EPISODES|EPISODE|EPS\.|EPS|EP\.|EP|CAPITULO|EPISODIO|FOLGE)\s*([0]+[0-9]*|[1-9][0-9]*)([^a-zA-Z\d]*)|\[|\]|\(|\)|\{|\}|-/ig, '').trim();
                if (episodeTitle != '') {
                    this.animeInfo.episodeTitle = episodeTitle;
                    this.replaceWorkingTitle(episodeTitleRegex, '');
                    this.replaced1 = 'true (1)';
                }

            } else if (foundSecondEpisodeTitle != null) {
                const secondEpisodeTitle = foundSecondEpisodeTitle[0].toString().replace(new RegExp('((?<![^a-zA-Z\\d\\s\\[\\]\\(\\)\\{\\}#\\+-])(-|#|\\+?)\\b' + this.animeInfo.episodeOrMovieNumber + '\\b(?![^a-zA-Z\\d\\s\\[\\]\\(\\)\\{\\}\\-\\,]))([^a-zA-Z\\d]*)|\\[|\\]|\\(|\\)|\\{|\\}|-/ig'), '').trim();
                if (secondEpisodeTitle != '') {
                    this.animeInfo.episodeTitle = secondEpisodeTitle;
                    this.replaceWorkingTitle(secondTitleRegex, '');
                    this.replaced2 = 'true (2)';
                }
            }
        }
    }

    // Remove Episode Info
    private removeEpisodeInfo() {
        const firstEpisodeRemoval = /(EPISODE\.|EPISODES|EPISODE|EPS\.|EPS|EP\.|EP|CAPITULO|EPISODIO|FOLGE)\s*([^a-zA-Z\d\(\[\{\)\]\}\.]*)\d+-\d+(?![^a-zA-Z\d\s\[\]\(\)\{\}\-\,])|(EPISODE\.|EPISODES|EPISODE|EPS\.|EPS|EP\.|EP|CAPITULO|EPISODIO|FOLGE)\s*([^a-zA-Z\d\(\[\{\)\]\}\.]*)\s*(\d+\.\d{1})(?!\d+)([^a-zA-Z\d\(\[\{\)\]\}\-\,]*)|(EPISODE\.|EPISODES|EPISODE|EPS\.|EPS|EP\.|EP|CAPITULO|EPISODIO|FOLGE)\s*([^a-zA-Z\d\(\[\{\)\]\}]*)\s*([0]+[0-9]*|[1-9][0-9]*)([^a-zA-Z\d\(\[\{\)\]\}]*)/ig;
        const secondEpisodeRemoval = /\b\d+\d\b(?![^a-zA-Z\d\s\[\]\(\)\{\}])|\b\d+\.5\b(?![^a-zA-Z\d\s\[\]\(\)\{\}])|(?<![^a-zA-Z\d\s\[\]\(\)\{\}])\b\d+\b(?![^a-zA-Z\d\s\[\]\(\)\{\}])/g;
        const getSecondEpisode = this.workingTitle.match(secondEpisodeRemoval);
        const numberRangeRemoval = /(?<![^a-zA-Z\d\s\[\]\(\)\{\}#\+-])(-|#|\+?)\b\d+-\d+\b(?![^a-zA-Z\d\s\[\]\(\)\{\}\-\,])/;
        const getNumberRange = this.workingTitle.match(numberRangeRemoval);

        if (firstEpisodeRemoval.test( this.workingTitle )) {
            this.replaceWorkingTitle(firstEpisodeRemoval, ' ');

        } else if (this.replaced1 == null && this.replaced2 == null && getNumberRange != null) {
            this.replaceWorkingTitle(numberRangeRemoval, ' ');

        } else if (this.replaced1 == null && this.replaced2 == null && getSecondEpisode != null) {
            this.replaceWorkingTitle(getSecondEpisode[getSecondEpisode.length - 1].toString(), ' ');
        }
    }

    // Clean Up
    private cleanUp() {
        const cleanUpRegex = /-|&/g;
        const performCleanUp = this.workingTitle.match(cleanUpRegex);

        if (performCleanUp != null) {
            this.replaceWorkingTitle(cleanUpRegex, ' ');
        }
    }

    // Get Release Group
    private getReleaseGroup() {
        const otherGroupsRegex = /(?:^\[)*[^\[\]]*?(?:\])|(?:^\()*[^\(\)]*?(?:\))|(?:^\{)*[^\{\}]*?(?:\})|(?:\[)*[^\[\]]*?(?:\])(?!\s*[a-zA-Z])|(?:\()*[^\(\)]*?(?:\))(?!\s*[a-zA-Z])|(?:\{)*[^\{\}]*?(?:\})(?!\s*[a-zA-Z])/;
        const foundOtherGroup = this.workingTitle.match(otherGroupsRegex);

        if (this.animeInfo.releaseGroup == null) {
            if (foundOtherGroup != null) {
                const releaseGroup = foundOtherGroup.toString().replace(/\[|\]|\(|\)|\{|\}/g, '').trim();
                if (releaseGroup != '') {
                    this.animeInfo.releaseGroup = releaseGroup;
                    this.replaceWorkingTitle(otherGroupsRegex, '');
                }
            }
        }
    }

    // Prepare for Title
    private prepareForTitle() {
        const removeEnclosedRegex = /(?:\[)[^\[\]]*?(?:\])|(?:\()[^\(\)]*?(?:\))|(?:\{)[^\{\}]*?(?:\})/g;
        const checkEnclosedTitle = this.workingTitle.replace(removeEnclosedRegex, '').replace(/\[|\]|\(|\)|\{|\}/g, '').trim();

        if (checkEnclosedTitle == '') {
            this.replaceWorkingTitle(/\[\s*\]|\(\s*\)|\{\s*\}/g, '');
            const foundTitle = this.workingTitle.match(/(?:\[)[^\[\]]*?(?:\])|(?:\()[^\(\)]*?(?:\))|(?:\{)[^\{\}]*?(?:\})/);
            if (foundTitle != null) {
                this.animeInfo.title = foundTitle.toString().replace(/\s\s+/g, ' ');
            }

        } else {
            this.replaceWorkingTitle(removeEnclosedRegex, '');
            this.animeInfo.title = this.workingTitle.replace(/\[|\]|\(|\)|\{|\}|\.$/g, '').replace(/\s\s+/g, ' ').trim();
        }
    }

    // Helper
    private replaceWorkingTitle(regExp: RegExp|string, replaceValue: string) {
        this.workingTitle = this.workingTitle.replace(regExp, replaceValue);
    }
}
