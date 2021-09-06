public ActionResult ResolveLocation()
{
     // Check the User Agent
     var agent = Request.UserAgent.ToLower();

     // Check if IOS
     if(agent.Contains("ios"))
     {
          // mlb.com
     }
     else if(agent.Contains("android"))
     {
          // nba.com
     }
     else
     {
          // nfl.com
     }
}