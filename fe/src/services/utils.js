class Utils {

    roundTo(num, decimals) {
        let decimalPow = 2;
        if (!(decimals >= 0)) {
            decimalPow = decimals;
        }
        return Math.round( ( num + Number.EPSILON ) * Math.pow(10, decimalPow) ) / Math.pow(10, decimalPow);        
    }


   getHTTPError(error) {
       if (error.response) {
           // The request was made and the server responded with a status code
           // that falls out of the range of 2xx
           if (error.response.data) {
               if (error.response.data.error)
                   return error.response.data.error;
               if (error.response.data.message)
                   return error.response.data.message;
               return error.response.data;
           }
         }
       return error.message;
   }

    getDateToURLParam(dt) {        
        return `${dt.getFullYear()}-${(dt.getMonth()+1).toString().padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')}`;
    }

    getDateToStrShow(dt, includeTime = true, longDate) {
        let dtDate = dt;
        if (typeof dtDate === 'string') {
            dtDate = new Date(dtDate);
        }
        let strRet = '';
        if (longDate) {
            strRet = dtDate.toLocaleDateString('default', {month: 'long', year: 'numeric', day: 'numeric'});        
        } else {
            strRet = `${dtDate.getDate().toString().padStart(2, '0')}/${(dtDate.getMonth()+1).toString().padStart(2, '0')}/` + 
                    `${dtDate.getFullYear().toString()}`;            
        }       
        if (includeTime) {
            strRet += ` - ${this.getTimeToStrShow(dtDate)}`;
        }
        return strRet;
    }

    getTimeToStrShow(dt) {
        let dtDate = dt;
        if (typeof dtDate === 'string') {
            dtDate = new Date(dtDate);
        }
        return `${dtDate.getHours().toString().padStart(2, '0')}:${dtDate.getMinutes().toString().padStart(2, '0')}`;        
    }

   getFloatFromStr(value) {
       if (typeof value === 'number') return value;
       if (typeof value === 'string') {
           return parseFloat(value.replace(',',''));           
       }
       return 0;
   }

   redirectToErrorPage(history, err) {        
       if (err.response) {
           if (err.response.status === 404)  {                
                                
              history.replace(`/notfound/?requestedURL=${history.location ? history.location.pathname : ''}`);
              return;
           }
        }
        history.replace(`/unknown-error/?requestedURL=${history.location ? history.location.pathname :  ''}&message=${this.getHTTPError(err)}`);
   }   

    formatFloatAsTime(value, includeSeconds = true) {      
        let hrs = Math.trunc(value * 24);
        let mins = Math.abs(Math.trunc((value -(hrs / 24)) * 24 * 60));
        if (mins === 60) {
            mins = 0;
            hrs += 1;
        }
        let secs = Math.abs(Math.round( (value - (hrs/ 24 ) - (mins / 60 / 24 ) ) * 24 * 60 * 60));
        if (secs === 60) {
            secs = 0;
            mins += 1;
        }
        if (includeSeconds) {
            return hrs.toString().padStart(2, '0') + ':' + mins.toString().padStart(2, '0') + ':' + secs.toString().substring(0, 2).padStart(2, '0');
        } else {
            return hrs.toString().padStart(2, '0') + ':' + mins.toString().padStart(2, '0');
        }      
    }

    hasClickedOnClass(target, classTarget, elementsToExclude = [], classesToExclude = []) {
        let par = target;        
        while (par) {
           const tgName = par.tagName;
           if (elementsToExclude.includes(tgName)) {
              return false;
           }
            if (par.className && (typeof par.className === 'string') ) {
                const elClasses = par.className.split(' ');
                for (let i = 0; i <= (classesToExclude.length -1); i++  ) {
                    if (elClasses.includes(classesToExclude[i])) {
                        return false;
                    }
                }                
                if (elClasses.includes(classTarget) ) {
                    return true;
              }                  
           }         
           par = par.parentElement;         
        }   
        return false;
    }


    formatDecimalHours(value) {
        let str = Math.trunc(value).toString().padStart(2, '0') + ':';
        str += Math.trunc((value - Math.trunc(value)) * 60).toString().padStart(2, '0');
        return str;
    }

    getDateStr(dt) {
        return  dt.getDate().toString().padStart(2, '0') + '/' + 
            (dt.getMonth() +1).toString().padStart(2, '0') + '/' + 
            (dt.getFullYear().toString());
    }

    getStrToDate(strDate) {
        const dtParts = strDate.split('/');
        if (dtParts.length === 3) {
            const day = parseInt(dtParts[0]);
            const month = parseInt(dtParts[1]);
            const year = parseInt(dtParts[2]);
            if (day >= 1 && day <= 31) {
                if (month >= 1 && month <= 12 ) {
                    if (year.toString().length === 4) {                       
                        return new Date(year, month-1, day);
                    }
                }
            }
        }
        return null;    
    }

    getTimeStrToTime(str) {
        if (str?.length >= 2) {
            const hour = parseInt(str.substring(0, 2));
            let minute = 0;
            if (str.length >= 5) {
                minute = parseInt(str.substring(3, 5));
                if (minute > 60) {
                    minute = 59;
                }
            }
            return {hour: hour, minute: (minute ?? 0)};
        }
    }

    

    getWeekFromDate(dt)    {
        let dtDay = dt;
        if (typeof dt === 'string') {
            dtDay = new Date(dt);
        }                
        if (dtDay.getDay() === 0) {
            dtDay = this.addDays(dtDay, 6 * -1);
        } else {
            dtDay = this.addDays(dtDay, (dtDay.getDay()-1) * -1);
        }         
        const dtTo = this.addDays(dtDay, 6);
        return [dtDay, dtTo];
    }

    getWeekFromDateStr(dt) {
        const [dtStart, dtEnd] = this.getWeekFromDate(dt);
        return this.getDateStr(dtStart) + ' to ' + this.getDateStr(dtEnd);
    }

    addDays(baseDate, days) {
        return new Date(baseDate.getTime() + (86400000 * days));
    }

   
    getDayName(dt) {
       let dtDay = dt;
       if (typeof dt === 'string') {
           dtDay = new Date(dt);
       }
       return dtDay.toLocaleDateString('default', {weekday: 'long'});
    }

    getDayNumAndName(dt) {
        let dtDay = dt;
        if (typeof dt === 'string') {
            dtDay = new Date(dt);
        }
        return  dtDay.getDate().toString().padStart(2, '0') + ' - ' + dtDay.toLocaleDateString('default', {weekday: 'short'});
    }
    
    getHoursShort(dt) {
        let dtDay = dt;
        if (typeof dt === 'string') {
            dtDay = new Date(dt);
        }
        return dtDay.getHours().toString().padStart(2, '0') + ':' + dtDay.getMinutes().toString().padStart(2, '0');
    }

    getDayMonth(dt) {
        let dtDay = dt;
        if (typeof dt === 'string') {
            dtDay = new Date(dt);
        }
        return dtDay.getDate().toString().padStart(2, '0') + '/' + dtDay.toLocaleDateString('default', {month: 'short'});
     }

     validateEmail(email) {        
        const emailExp = /\S+@\S+\.\S+/;
        return emailExp.test(email);          
    }

}


export default new Utils();