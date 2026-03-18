const crypto = require('crypto');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendPasswordResetEmail } = require('../utils/email');

const BLOCKED_DOMAINS = [
  'mailinator.com','guerrillamail.com','tempmail.com','throwam.com','sharklasers.com',
  'guerrillamailblock.com','grr.la','guerrillamail.info','guerrillamail.biz','guerrillamail.de',
  'guerrillamail.net','guerrillamail.org','spam4.me','trashmail.com','trashmail.me',
  'trashmail.net','trashmail.at','trashmail.io','trashmail.xyz','yopmail.com','yopmail.fr',
  'cool.fr.nf','jetable.fr.nf','nospam.ze.tc','nomail.xl.cx','mega.zik.dj','speed.1s.fr',
  'courriel.fr.nf','moncourrier.fr.nf','monemail.fr.nf','monmail.fr.nf','dispostable.com',
  'mailnull.com','spamgourmet.com','spamgourmet.net','spamgourmet.org','spamspot.com',
  'spamthis.co.uk','spamtroll.net','tempr.email','discard.email','spamgob.com',
  'fakeinbox.com','mailnesia.com','maildrop.cc','spamfree24.org','spamfree24.de',
  'spamfree24.eu','spamfree24.info','spamfree24.net','spamfree.eu','spam.la',
  'spamoff.de','spamgob.com','throwam.com','throwam.net','throwam.org',
  'getairmail.com','filzmail.com','throwam.com','dispostable.com','mailnull.com',
  'spamgourmet.com','tempr.email','discard.email','spamgob.com','fakeinbox.com',
  'mailnesia.com','maildrop.cc','mohmal.com','tempinbox.com','tempinbox.net',
  'spamgob.com','throwam.com','dispostable.com','mailnull.com','spamgourmet.com',
  'tempr.email','discard.email','spamgob.com','fakeinbox.com','mailnesia.com',
  'maildrop.cc','mohmal.com','tempinbox.com','tempinbox.net','10minutemail.com',
  '10minutemail.net','10minutemail.org','10minutemail.de','10minutemail.co.uk',
  'minutemail.com','20minutemail.com','30minutemail.com','60minutemail.com',
  'tempmail.net','tempmail.org','tempmail.de','tempmail.co.uk','tempmail.us',
  'temp-mail.org','temp-mail.ru','temp-mail.io','tmpmail.net','tmpmail.org',
  'getnada.com','nada.email','spamgob.com','throwam.com','dispostable.com',
  'mailnull.com','spamgourmet.com','tempr.email','discard.email','spamgob.com',
  'fakeinbox.com','mailnesia.com','maildrop.cc','mohmal.com','tempinbox.com',
  'crazymailing.com','spamfree.eu','spam.la','spamoff.de','spamgob.com',
  'throwam.com','dispostable.com','mailnull.com','spamgourmet.com','tempr.email',
  'discard.email','spamgob.com','fakeinbox.com','mailnesia.com','maildrop.cc',
  'mohmal.com','tempinbox.com','tempinbox.net','sharklasers.com','guerrillamail.info',
  'grr.la','guerrillamail.biz','guerrillamail.de','guerrillamail.net','guerrillamail.org',
  'guerrillamail.com','guerrillamailblock.com','spam4.me','trashmail.com','trashmail.me',
  'trashmail.net','trashmail.at','trashmail.io','trashmail.xyz','yopmail.com',
  'cool.fr.nf','jetable.fr.nf','nospam.ze.tc','nomail.xl.cx','mega.zik.dj',
  'speed.1s.fr','courriel.fr.nf','moncourrier.fr.nf','monemail.fr.nf','monmail.fr.nf',
  'dispostable.com','mailnull.com','spamgourmet.com','spamgourmet.net','spamgourmet.org',
  'spamspot.com','spamthis.co.uk','spamtroll.net','tempr.email','discard.email',
  'spamgob.com','fakeinbox.com','mailnesia.com','maildrop.cc','spamfree24.org',
  'spamfree24.de','spamfree24.eu','spamfree24.info','spamfree24.net','spamfree.eu',
  'spam.la','spamoff.de','getairmail.com','filzmail.com','mohmal.com','tempinbox.com',
  'crazymailing.com','throwam.com','dispostable.com','mailnull.com','spamgourmet.com',
  'tempr.email','discard.email','spamgob.com','fakeinbox.com','mailnesia.com',
  'maildrop.cc','mohmal.com','tempinbox.com','tempinbox.net','inboxbear.com',
  'owlpic.com','spamgob.com','throwam.com','dispostable.com','mailnull.com',
  'spamgourmet.com','tempr.email','discard.email','spamgob.com','fakeinbox.com',
  'mailnesia.com','maildrop.cc','mohmal.com','tempinbox.com','tempinbox.net',
  'harakirimail.com','spamgob.com','throwam.com','dispostable.com','mailnull.com',
  'spamgourmet.com','tempr.email','discard.email','spamgob.com','fakeinbox.com',
  'mailnesia.com','maildrop.cc','mohmal.com','tempinbox.com','tempinbox.net',
  'binkmail.com','bob.email','clrmail.com','dcctb.com','dingbone.com','dumpmail.de',
  'durandinterstellar.com','email60.com','emailfake.com','emailfreedom.com',
  'emailinfive.com','emailmiser.com','emailsensei.com','emailtemporanea.com',
  'emailtemporanea.net','emailtemporanea.org','emailto.de','emailwarden.com',
  'emailx.at.hm','emailxfer.com','emkei.cz','emz.net','enterto.com','ephemail.net',
  'etranquil.com','etranquil.net','etranquil.org','explodemail.com','express.net.ua',
  'extremail.ru','eyepaste.com','fakemailgenerator.com','fakemailgenerator.net',
  'fakemail.fr','fakemail.net','fakemailz.com','fammix.com','fansworldwide.de',
  'fantasymail.de','fightallspam.com','filzmail.com','fivemail.de','fleckens.hu',
  'flurre.com','flurred.com','flyspam.com','frapmail.com','freundin.ru',
  'front14.org','fuckingduh.com','fudgerub.com','fux0ringduh.com','fyii.de',
  'garliclife.com','gehensiemirnichtaufdensack.de','get1mail.com','get2mail.fr',
  'getonemail.com','getonemail.net','ghosttexter.de','girlsundertheinfluence.com',
  'gishpuppy.com','gmal.com','gmial.com','goemailgo.com','gorillaswithdirtyarmpits.com',
  'gotmail.net','gotmail.org','gowikibooks.com','gowikicampus.com','gowikicars.com',
  'gowikifilms.com','gowikigames.com','gowikimusic.com','gowikinetwork.com',
  'gowikitravel.com','gowikitv.com','grandmamail.com','grandmasmail.com',
  'great-host.in','greensloth.com','grr.la','gsrv.co.uk','guerillamail.biz',
  'guerillamail.com','guerillamail.de','guerillamail.info','guerillamail.net',
  'guerillamail.org','guerillamail.us','guerrillamail.biz','guerrillamail.com',
  'guerrillamail.de','guerrillamail.info','guerrillamail.net','guerrillamail.org',
  'guerrillamailblock.com','gustr.com','h.mintemail.com','h8s.org','hailmail.net',
  'harakirimail.com','hartbot.de','hat-geld.de','hatespam.org','herp.in',
  'hidemail.de','hidzz.com','hmamail.com','hopemail.biz','hulapla.de',
  'ieatspam.eu','ieatspam.info','ieh-mail.de','ihateyoualot.info','iheartspam.org',
  'imails.info','inbax.tk','inbox.si','inboxalias.com','inboxclean.com',
  'inboxclean.org','infocom.zp.ua','instant-mail.de','ip6.li','ipoo.org',
  'irish2me.com','iwi.net','jetable.com','jetable.fr.nf','jetable.net',
  'jetable.org','jnxjn.com','jourrapide.com','jsrsolutions.com','junk.to',
  'justamail.net','kasmail.com','kaspop.com','killmail.com','killmail.net',
  'klassmaster.com','klassmaster.net','klassmaster.org','klzlk.com','koszmail.pl',
  'kurzepost.de','letthemeatspam.com','lhsdv.com','lifebyfood.com','link2mail.net',
  'litedrop.com','lol.ovpn.to','lolfreak.net','lookugly.com','lortemail.dk',
  'losemymail.com','lovemeleaveme.com','lr78.com','lroid.com','lukop.dk',
  'lukemail.com','luvtospam.net','m21.cc','maboard.com','mail-filter.com',
  'mail-temporaire.fr','mail.by','mail.mezimages.net','mail.zp.ua','mail1a.de',
  'mail21.cc','mail2rss.org','mail333.com','mailbidon.com','mailbiz.biz',
  'mailblocks.com','mailbucket.org','mailcat.biz','mailcatch.com','mailde.de',
  'mailde.info','maildrop.cc','maileater.com','mailed.ro','mailexpire.com',
  'mailf5.com','mailfall.com','mailfreeonline.com','mailguard.me','mailimate.com',
  'mailin8r.com','mailinater.com','mailinator.com','mailinator.net','mailinator.org',
  'mailinator.us','mailinator2.com','mailincubator.com','mailismagic.com',
  'mailme.ir','mailme.lv','mailme24.com','mailmetrash.com','mailmoat.com',
  'mailms.com','mailnew.com','mailnull.com','mailorg.org','mailpick.biz',
  'mailproxsy.com','mailquack.com','mailrock.biz','mailscrap.com','mailseal.de',
  'mailshell.com','mailsiphon.com','mailslapping.com','mailslite.com','mailsoul.com',
  'mailtome.de','mailtothis.com','mailtrash.net','mailtv.net','mailtv.tv',
  'mailzilla.com','mailzilla.org','makemetheking.com','manifestgenerator.com',
  'manybrain.com','mbx.cc','mega.zik.dj','meinspamschutz.de','meltmail.com',
  'messagebeamer.de','mezimages.net','mfsa.ru','mierdamail.com','mintemail.com',
  'misterpinball.de','mjukglass.nu','moakt.com','moakt.cc','moakt.co','moakt.ws',
  'mohmal.com','moncourrier.fr.nf','monemail.fr.nf','monmail.fr.nf','msa.minsmail.com',
  'mt2009.com','mt2014.com','mt2015.com','mx0.wwwnew.eu','my10minutemail.com',
  'mymail-in.net','mymailoasis.com','mynetstore.de','mypacks.net','mypartyclip.de',
  'myphantomemail.com','mysamp.de','myspaceinc.com','myspaceinc.net','myspaceinc.org',
  'myspacepimpedup.com','myspamless.com','mytempemail.com','mytempmail.com',
  'mytrashmail.com','nabuma.com','neomailbox.com','nepwk.com','nervmich.net',
  'nervtmich.net','netmails.com','netmails.net','netzidiot.de','nevermail.de',
  'newbpotato.tk','nice-4u.com','nincsmail.com','nnh.com','no-spam.ws',
  'noblepioneer.com','nobulk.com','noclickemail.com','nogmailspam.info','nomail.pw',
  'nomail.xl.cx','nomail2me.com','nomorespamemails.com','nonspam.eu','nonspammer.de',
  'noref.in','nospam.ze.tc','nospam4.us','nospamfor.us','nospammail.net',
  'nospamthanks.info','notmailinator.com','nowmymail.com','nwldx.com','objectmail.com',
  'obobbo.com','odnorazovoe.ru','oneoffemail.com','onewaymail.com','onlatedotcom.info',
  'online.ms','oopi.org','opayq.com','ordinaryamerican.net','otherinbox.com',
  'ourklips.com','outlawspam.com','ovpn.to','owlpic.com','pancakemail.com',
  'paplease.com','pcusers.otherinbox.com','pepbot.com','peterdethier.com',
  'phantomemail.com','phentermine-mortgages.com','pimpedupmyspace.com','pjjkp.com',
  'plexolan.de','poczta.onet.pl','politikerclub.de','poofy.org','pookmail.com',
  'postacı.com','postfach.cc','privacy.net','privatdemail.net','proxymail.eu',
  'prtnx.com','prtz.eu','pubmail.io','punkass.com','putthisinyourspamdatabase.com',
  'pwrby.com','qq.com','quickinbox.com','quickmail.nl','rcpt.at','recode.me',
  'recursor.net','recyclemail.dk','regbypass.com','regbypass.comsafe-mail.net',
  'rejectmail.com','rklips.com','rmqkr.net','royal.net','rppkn.com','rtrtr.com',
  's0ny.net','safe-mail.net','safersignup.de','safetymail.info','safetypost.de',
  'sandelf.de','saynotospams.com','schafmail.de','schrott-email.de','secretemail.de',
  'secure-mail.biz','selfdestructingmail.com','sendspamhere.com','senseless-entertainment.com',
  'services391.com','sharklasers.com','shieldedmail.com','shiftmail.com','shitmail.me',
  'shitmail.org','shitware.nl','shmeriously.com','shortmail.net','sibmail.com',
  'sinnlos-mail.de','skeefmail.com','slapsfromlastnight.com','slaskpost.se',
  'slopsbox.com','slushmail.com','smashmail.de','smellfear.com','smwg.info',
  'snakemail.com','sneakemail.com','sneakmail.de','snkmail.com','sofimail.com',
  'sofort-mail.de','sogetthis.com','soodonims.com','spam.la','spam.su','spam4.me',
  'spamavert.com','spambob.com','spambob.net','spambob.org','spambog.com',
  'spambog.de','spambog.ru','spambox.info','spambox.irishspringrealty.com',
  'spambox.us','spamcannon.com','spamcannon.net','spamcero.com','spamcon.org',
  'spamcorptastic.com','spamcowboy.com','spamcowboy.net','spamcowboy.org',
  'spamday.com','spamex.com','spamfree.eu','spamfree24.de','spamfree24.eu',
  'spamfree24.info','spamfree24.net','spamfree24.org','spamgob.com','spamgoes.in',
  'spamgourmet.com','spamgourmet.net','spamgourmet.org','spamherelots.com',
  'spamhereplease.com','spamhole.com','spamify.com','spaminator.de','spamkill.info',
  'spaml.com','spaml.de','spammotel.com','spammy.host','spamoff.de','spamslicer.com',
  'spamspot.com','spamstack.net','spamthis.co.uk','spamthisplease.com',
  'spamtroll.net','spamwc.de','spamwc.net','spamwc.org','speed.1s.fr',
  'spoofmail.de','stuffmail.de','super-auswahl.de','supergreatmail.com',
  'supermailer.jp','superrito.com','superstachel.de','suremail.info','svk.jp',
  'sweetxxx.de','tafmail.com','tagyourself.com','teewars.org','teleworm.com',
  'teleworm.us','temp-mail.de','temp-mail.io','temp-mail.org','temp-mail.ru',
  'temp.emeraldwebmail.com','temp.headstrong.de','tempail.com','tempalias.com',
  'tempe-mail.com','tempemail.biz','tempemail.com','tempemail.net','tempemail.org',
  'tempinbox.co.uk','tempinbox.com','tempmail.com','tempmail.de','tempmail.eu',
  'tempmail.it','tempmail.net','tempmail.org','tempmail.us','tempmail2.com',
  'tempomail.fr','temporaryemail.com','temporaryemail.net','temporaryemail.org',
  'temporaryforwarding.com','temporaryinbox.com','temporarymail.org','tempsky.com',
  'tempthe.net','tempymail.com','thanksnospam.info','thecloudindex.com',
  'thisisnotmyrealemail.com','throam.com','throwam.com','throwam.net','throwam.org',
  'throwaway.email','throwam.com','throwam.net','throwam.org','throwaway.email',
  'throwam.com','throwam.net','throwam.org','throwaway.email','tilien.com',
  'tittbit.in','tizi.com','tmailinator.com','toiea.com','tradermail.info',
  'trash-mail.at','trash-mail.com','trash-mail.de','trash-mail.io','trash-mail.net',
  'trash2009.com','trash2010.com','trash2011.com','trashdevil.com','trashdevil.de',
  'trashemail.de','trashmail.at','trashmail.com','trashmail.de','trashmail.io',
  'trashmail.me','trashmail.net','trashmail.org','trashmail.xyz','trashmailer.com',
  'trashymail.com','trashymail.net','trashymail.org','trbvm.com','trillianpro.com',
  'tryalert.com','turual.com','twinmail.de','tyldd.com','uggsrock.com',
  'umail.net','uroid.com','us.af','venompen.com','veryrealemail.com',
  'viditag.com','viewcastmedia.com','viewcastmedia.net','viewcastmedia.org',
  'vomoto.com','vpn.st','vsimcard.com','vubby.com','wasteland.rfc822.org',
  'webemail.me','webm4il.info','weg-werf-email.de','wegwerf-emails.de',
  'wegwerfadresse.de','wegwerfemail.com','wegwerfemail.de','wegwerfemail.net',
  'wegwerfemail.org','wegwerfmail.de','wegwerfmail.info','wegwerfmail.net',
  'wegwerfmail.org','wh4f.org','whyspam.me','willhackforfood.biz','willselfdestruct.com',
  'winemaven.info','wronghead.com','wuzupmail.net','www.e4ward.com','www.gishpuppy.com',
  'www.mailinator.com','wwwnew.eu','xagloo.com','xemaps.com','xents.com',
  'xmaily.com','xoxy.net','xyzfree.net','yapped.net','yeah.net','yep.it',
  'yogamaven.com','yopmail.com','yopmail.fr','yopmail.net','yopmail.org',
  'yourdomain.com','ypmail.webarnak.fr.eu.org','yuurok.com','z1p.biz','za.com',
  'zehnminuten.de','zehnminutenmail.de','zippymail.info','zoemail.net','zoemail.org',
  'zomg.info','zxcv.com','zxcvbnm.com','zzz.com'
];

function isBlockedEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return true;
  return BLOCKED_DOMAINS.includes(domain);
}

exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'All fields required' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email address' });

    if (isBlockedEmail(email)) return res.status(400).json({ message: 'Please use a real email address' });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ message: 'Username or email already taken' });

    const user = await User.create({ username, email, password, fullName });
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(201).json({ accessToken, refreshToken, user: user.toPublicJSON() });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: err.message || 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    if (user.isBanned) return res.status(403).json({ message: 'Account suspended' });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.json({ accessToken, refreshToken, user: user.toPublicJSON() });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: err.message || 'Login failed' });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
      await user.save();
    }
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(refreshToken))
      return res.status(401).json({ message: 'Invalid refresh token' });

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ message: 'If that email exists, a reset link was sent' });

    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    await sendPasswordResetEmail(user.email, token);
    res.json({ message: 'If that email exists, a reset link was sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Token invalid or expired' });

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = [];
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshTokens');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
